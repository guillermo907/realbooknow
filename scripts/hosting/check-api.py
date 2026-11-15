"""Integration check using existing PHP/MySQL binaries in isolated /tmp services.
Does not touch an existing MySQL server, cPanel, or Google account.
"""
import tempfile,subprocess,os,socket,time,json,urllib.request,urllib.error,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def port():
 with socket.socket() as s:s.bind(('127.0.0.1',0));return s.getsockname()[1]
def run(cmd,**kw):
 r=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kw)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
 return r
def main():
 for name in ['mysqld','mysql','php']:
  if not shutil.which(name):raise SystemExit('Required existing binary missing: '+name)
 with tempfile.TemporaryDirectory(prefix='vesper-api-') as d:
  work=Path(d);db=work/'db';db.mkdir();sessions=work/'sessions';sessions.mkdir();web=work/'web';web.mkdir();shutil.copytree(ROOT/'server/api',web/'api');(web/'data').mkdir();(web/'data/global-songs.json').write_text(json.dumps({'format':'vesper-global-catalog','version':1,'songs':[]}));sock=str(work/'mysql.sock');http=port();base='http://127.0.0.1:'+str(http)
  run(['mysqld','--no-defaults','--initialize-insecure','--datadir='+str(db)])
  log=(work/'mysql.log').open('w');sqlserver=subprocess.Popen(['mysqld','--no-defaults','--datadir='+str(db),'--socket='+sock,'--skip-networking','--mysqlx=OFF','--log-error='+str(work/'db-error.log')],stdout=log,stderr=log)
  php=None
  try:
   for _ in range(100):
    if Path(sock).exists():break
    if sqlserver.poll() is not None:raise RuntimeError((work/'db-error.log').read_text())
    time.sleep(.1)
   sql=['mysql','--no-defaults','--socket='+sock,'-uroot','--batch','--skip-column-names'];run(sql,input=b'CREATE DATABASE vesper_test;');run(sql+['vesper_test'],input=(ROOT/'server/sql/001_accounts_catalog.sql').read_bytes());run(sql+['vesper_test'],input=b"INSERT INTO vesper_users(google_sub,email,display_name) VALUES ('google-admin','admin@example.test','Admin'),('google-user','user@example.test','User');")
   config=work/'config.php';config.write_text("<?php return "+"['base_url'=>'"+base+"','allow_local_http'=>true,'db_dsn'=>'mysql:unix_socket="+sock+";dbname=vesper_test;charset=utf8mb4','db_user'=>'root','db_password'=>'','google_client_id'=>'test-client','google_client_secret'=>'test-secret','admin_emails'=>['admin@example.test'],'session_seconds'=>3600];")
   for uid,sid in [(1,'adminsession'),(2,'usersession')]:
    code="session_name('VesperSession');session_id('"+sid+"');session_start();$_SESSION=['user_id'=>"+str(uid)+",'csrf'=>'test-csrf','expires'=>time()+3600];session_write_close();"
    run(['php','-d','session.save_path='+str(sessions),'-r',code])
   env={**os.environ,'VESPER_CONFIG':str(config)};php=subprocess.Popen(['php','-d','session.save_path='+str(sessions),'-S','127.0.0.1:'+str(http),'-t',str(web)],env=env,stdout=subprocess.DEVNULL,stderr=(work/'php.log').open('w'))
   for _ in range(100):
    try:urllib.request.urlopen(base+'/api/index.php?action=session',timeout=.2);break
    except Exception:time.sleep(.05)
   def request(action,method='GET',data=None,sid=None,csrf=True,extra=None):
    headers={'Content-Type':'application/json','Origin':base,**(extra or {})}
    if sid:headers['Cookie']='VesperSession='+sid
    if csrf:headers['X-CSRF-Token']='test-csrf'
    r=urllib.request.Request(base+'/api/index.php?action='+action,data=json.dumps(data).encode() if data is not None else None,method=method,headers=headers)
    try:response=urllib.request.urlopen(r)
    except urllib.error.HTTPError as e:response=e
    raw=response.read();return response.status,json.loads(raw) if raw else None,response.headers
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
   songs=[{'title':'Original test','composer':'Test','key':'D','style':'Medium Swing','chart':'D-7|G7Z','tempo':136,'choruses':3}]
   assert request('publish','POST',{'songs':songs},'usersession')[0]==403
   assert request('publish','POST',{'songs':songs},'adminsession')[0]==200
   assert request('publish','POST',{'songs':songs},'adminsession')[0]==200
   status,catalog,headers=request('catalog');assert status==200 and len(catalog['songs'])==1 and 'Set-Cookie' not in headers
   assert request('catalog',extra={'If-None-Match':headers['ETag']})[0]==304
   assert request('callback&state=wrong&code=fake')[0]==400
   assert request('logout','POST',{},'usersession')[0]==200
   assert request('library',sid='usersession')[0]==401
   print(json.dumps({'php_mysql':'passed','checks':['auth','user isolation','csrf','optimistic conflict','admin publication','stable duplicate IDs','public ETag','invalid OAuth state','logout']}))
  finally:
   if php:php.terminate();php.wait(timeout=5)
   sqlserver.terminate();sqlserver.wait(timeout=15);log.close()
if __name__=='__main__':main()
