"""PHP API contract checks using SQLite only as a TEST SQL adapter.
The temporary adapter rewrites MySQL upsert/locking syntax. Production is MySQL.
It does not validate MySQL DDL, row locks or a real Google token exchange.
"""
import tempfile,subprocess,os,socket,time,json,urllib.request,urllib.error,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def main():
 with tempfile.TemporaryDirectory(prefix='vesper-api-contract-') as d:
  work=Path(d);sessions=work/'sessions';sessions.mkdir();web=work/'web';shutil.copytree(ROOT/'out',web);shutil.copytree(ROOT/'server/api',web/'api');
  with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
  base='http://127.0.0.1:'+str(port);db=work/'test.sqlite';config=work/'config.php'
  config.write_text("<?php return ['base_url'=>'"+base+"','allow_local_http'=>true,'db_dsn'=>'sqlite:"+str(db)+"','db_user'=>'','db_password'=>'','google_client_id'=>'test-client','google_client_secret'=>'test-secret','admin_emails'=>['admin@example.test'],'session_seconds'=>3600];")
  bootstrap=web/'api/bootstrap.php';bootstrap.write_text(bootstrap.read_text().replace("const VESPER_MAX_BODY", "require __DIR__.'/test-adapter.php';\nconst VESPER_MAX_BODY").replace('new PDO(','new SQLiteTestPDO('))
  (web/'api/test-adapter.php').write_text('''<?php
class SQLiteTestPDO extends PDO {
 public function __construct($dsn,$user,$pass,$options){parent::__construct($dsn,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);$this->exec('PRAGMA foreign_keys=ON');}
 public function query(string $query,?int $fetchMode=null,mixed ...$args): PDOStatement|false {return parent::query(str_replace(' FOR UPDATE','',$query));}
 public function prepare(string $query,array $options=[]): PDOStatement|false {
 $query=str_replace(['INSERT IGNORE',' FOR UPDATE'],['INSERT OR IGNORE',''],$query);
 $query=str_replace('ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_by=VALUES(updated_by),updated_at=CURRENT_TIMESTAMP','ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP',$query);
 return parent::prepare($query,$options);
 }
}
''')
  init="""$db=new PDO('sqlite:"""+str(db)+"""');$db->exec(\"CREATE TABLE vesper_users(id INTEGER PRIMARY KEY,google_sub TEXT UNIQUE,email TEXT,display_name TEXT);CREATE TABLE vesper_libraries(user_id INTEGER PRIMARY KEY,revision INTEGER,payload TEXT,updated_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES vesper_users(id));CREATE TABLE vesper_global_charts(id TEXT PRIMARY KEY,payload TEXT,updated_by INTEGER,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);CREATE TABLE vesper_meta(name TEXT PRIMARY KEY,value INTEGER);INSERT INTO vesper_meta VALUES ('schema',1),('catalog_revision',0);INSERT INTO vesper_users VALUES (1,'admin-sub','admin@example.test','Admin'),(2,'user-sub','user@example.test','User');\");"""
  subprocess.run(['php','-r',init],check=True)
  for uid,sid in [(1,'adminsession'),(2,'usersession')]:subprocess.run(['php','-d','session.save_path='+str(sessions),'-r',"session_name('VesperSession');session_id('"+sid+"');session_start();$_SESSION=['user_id'=>"+str(uid)+",'csrf'=>'test-csrf','expires'=>time()+3600];session_write_close();"],check=True)
  process=subprocess.Popen(['php','-d','session.save_path='+str(sessions),'-S','127.0.0.1:'+str(port),'-t',str(web)],env={**os.environ,'VESPER_CONFIG':str(config)},stdout=subprocess.DEVNULL,stderr=(work/'php.log').open('w'))
  try:
   for _ in range(100):
    try:urllib.request.urlopen(base+'/api/index.php?action=session',timeout=.2);break
    except Exception:time.sleep(.05)
   def request(action,method='GET',data=None,sid=None,csrf=True,extra=None):
    headers={'Content-Type':'application/json','Origin':base,**(extra or {})}
    if sid:headers['Cookie']='VesperSession='+sid
    if csrf:headers['X-CSRF-Token']='test-csrf'
    req=urllib.request.Request(base+'/api/index.php?action='+action,data=json.dumps(data).encode() if data is not None else None,method=method,headers=headers)
    try:r=urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:r=e
    text=r.read();return r.status,json.loads(text) if text else None,r.headers
   assert request('library')[0]==401
   assert request('session',sid='adminsession')[1]['user']['admin'] is True
   assert request('session',sid='usersession')[1]['user']['admin'] is False
   library={'schemaVersion':2,'userSongs':[],'playlists':[{'id':'set','name':'Saved list','songIds':[]}],'folders':[],'globalPreferences':{}}
   assert request('library','PUT',{'revision':0,'library':library},'usersession',False)[0]==403
   assert request('library','PUT',{'revision':0,'library':library},'usersession')[1]['revision']==1
   assert request('library','PUT',{'revision':0,'library':library},'usersession')[0]==409
   assert request('library',sid='adminsession')[1]['library'] is None
   assert request('library&user_id=2',sid='adminsession')[1]['library'] is None
   assert request('library',sid='usersession')[1]['library']['playlists'][0]['name']=='Saved list'
   songs=[{'title':'Original API test','composer':'Test','key':'D','style':'Medium Swing','chart':'D-7|G7Z','tempo':136,'choruses':3}]
   assert request('publish','POST',{'songs':songs},'usersession')[0]==403
   assert request('publish','POST',{'songs':songs},'adminsession')[0]==200
   assert request('publish','POST',{'songs':songs},'adminsession')[0]==200
   status,catalog,headers=request('catalog');assert status==200 and len([s for s in catalog['songs'] if s['title']=='Original API test'])==1 and 'Set-Cookie' not in headers
   assert request('catalog',extra={'If-None-Match':headers['ETag']})[0]==304
   assert request('callback&state=wrong&code=fake')[0]==400
   if '--browser' in __import__('sys').argv:
    subprocess.run(['/Users/willy/.nvm/versions/node/v24.22.1/bin/node',str(ROOT/'scripts/hosting/check-account-browser.mjs'),base],check=True)
   assert request('logout','POST',{},'usersession')[0]==200
   assert request('library',sid='usersession')[0]==401
   print(json.dumps({'php_api_contract':'passed','database':'temporary SQLite test adapter; not MySQL certification','checks':['auth','user isolation','csrf','optimistic conflict','admin publication','duplicate IDs','catalog ETag','invalid OAuth state','logout']}))
  finally:process.terminate();process.wait(timeout=5)
if __name__=='__main__':main()
