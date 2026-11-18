<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
try {
 $action=$_GET['action']??'session';if(!is_string($action))fail(400,'Invalid action.');
 if(!config()){if($action==='session')answer(['available'=>false,'user'=>null]);fail(503,'Server setup is not complete.');}
 // Public catalog does not acquire a PHP session lock or send a session cookie.
 if($action==='catalog'){
  if($_SERVER['REQUEST_METHOD']!=='GET')fail(405,'Method not allowed.');$db=database();
  $revision=(int)$db->query("SELECT value FROM jazzbook_meta WHERE name='catalog_revision'")->fetchColumn();$file=dirname(__DIR__).'/data/global-songs.json';
  $etag='"jazzbook-'.hash('sha256',$revision.':'.(is_file($file)?filemtime($file).':'.filesize($file):'empty')).'"';header('ETag: '.$etag);header('Cache-Control: public, max-age=0, must-revalidate');
  if(($_SERVER['HTTP_IF_NONE_MATCH']??'')===$etag){http_response_code(304);exit;}
  $seed=is_file($file)?json_decode(file_get_contents($file),true,64,JSON_THROW_ON_ERROR):['songs'=>[]];$songs=[];foreach($seed['songs']??[] as $song)$songs[$song['id']]=$song;
  foreach($db->query('SELECT id,payload FROM jazzbook_global_charts') as $row){$song=json_decode($row['payload'],true,64,JSON_THROW_ON_ERROR);$songs[$row['id']]=$song;}
  answer(['format'=>'jazzbook-global-catalog','version'=>1,'revision'=>$revision,'songs'=>array_values($songs)]);
 }
 start_session();
 if($action==='health'){database()->query("SELECT value FROM jazzbook_meta WHERE name='schema'")->fetchColumn();answer(['ready'=>true,'schema'=>1]);}
 if($action==='session'){if($_SERVER['REQUEST_METHOD']!=='GET')fail(405,'Method not allowed.');answer(['available'=>true,'user'=>user(),'csrf'=>$_SESSION['csrf']]);}
 if($action==='login'){
  if($_SERVER['REQUEST_METHOD']!=='GET')fail(405,'Method not allowed.');
  $_SESSION['oauth']=['state'=>bin2hex(random_bytes(32)),'verifier'=>bin2hex(random_bytes(32)),'expires'=>time()+600];$o=$_SESSION['oauth'];
  $query=['client_id'=>config()['google_client_id'],'redirect_uri'=>base_url().'/api/index.php?action=callback','response_type'=>'code','scope'=>'openid email profile','state'=>$o['state'],'prompt'=>'select_account','code_challenge'=>rtrim(strtr(base64_encode(hash('sha256',$o['verifier'],true)),'+/','-_'),'='),'code_challenge_method'=>'S256'];
  header('Location: https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query($query),true,302);exit;
 }
 if($action==='callback'){
  $o=$_SESSION['oauth']??null;unset($_SESSION['oauth']);if(!$o||$o['expires']<time()||!is_string($_GET['state']??null)||!hash_equals($o['state'],$_GET['state']))fail(400,'Invalid or expired sign-in state. Start sign-in again.');
  if(isset($_GET['error'])){header('Location: '.base_url().'/?auth=cancelled',true,303);exit;}
  $code=bounded_string($_GET['code']??null,4096,'authorization code',true);
  $tokens=google_json('https://oauth2.googleapis.com/token',['client_id'=>config()['google_client_id'],'client_secret'=>config()['google_client_secret'],'code'=>$code,'code_verifier'=>$o['verifier'],'grant_type'=>'authorization_code','redirect_uri'=>base_url().'/api/index.php?action=callback']);
  $identity=google_json('https://openidconnect.googleapis.com/v1/userinfo',null,$tokens['access_token']);
  if(($identity['email_verified']??false)!==true)fail(403,'A verified Google email is required.');
  $sub=bounded_string($identity['sub']??null,255,'Google identity',true);$email=bounded_string($identity['email']??null,320,'email',true);$name=bounded_string($identity['name']??'',200,'name');
  $db=database();$q=$db->prepare('INSERT INTO jazzbook_users (google_sub,email,display_name) VALUES (?,?,?) ON DUPLICATE KEY UPDATE email=VALUES(email),display_name=VALUES(display_name),last_login=CURRENT_TIMESTAMP');$q->execute([$sub,$email,$name]);
  $q=$db->prepare('SELECT id FROM jazzbook_users WHERE google_sub=?');$q->execute([$sub]);$id=(int)$q->fetchColumn();session_regenerate_id(true);$_SESSION=['user_id'=>$id,'csrf'=>bin2hex(random_bytes(32)),'expires'=>time()+(config()['session_seconds']??604800)];
  header('Location: '.base_url().'/',true,303);exit;
 }
 if($action==='logout'){write_request('POST');$_SESSION=[];$cookie=session_get_cookie_params();unset($cookie['lifetime']);setcookie(session_name(),'',array_merge($cookie,['expires'=>time()-3600]));session_destroy();answer(['ok'=>true]);}
 if($action==='library'){
  $u=require_user();$db=database();
  if($_SERVER['REQUEST_METHOD']==='GET'){$q=$db->prepare('SELECT revision,payload,updated_at FROM jazzbook_libraries WHERE user_id=?');$q->execute([$u['id']]);$row=$q->fetch(PDO::FETCH_ASSOC);answer(['revision'=>$row?(int)$row['revision']:0,'library'=>$row?json_decode($row['payload'],true,64,JSON_THROW_ON_ERROR):null,'updatedAt'=>$row['updated_at']??null]);}
  write_request('PUT');$data=body();if(!is_int($data['revision']??null)||$data['revision']<0)fail(422,'Missing library revision.');$library=library_record($data['library']??[]);$json=json_encode($library,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
  $db->beginTransaction();$q=$db->prepare("INSERT IGNORE INTO jazzbook_libraries(user_id,revision,payload) VALUES (?,0,'null')");$q->execute([$u['id']]);$q=$db->prepare('SELECT revision FROM jazzbook_libraries WHERE user_id=? FOR UPDATE');$q->execute([$u['id']]);$version=(int)$q->fetchColumn();
  if($version!==$data['revision']){$db->rollBack();fail(409,'Another device saved a newer library. Your local copy is safe.');}
  $q=$db->prepare('UPDATE jazzbook_libraries SET revision=revision+1,payload=? WHERE user_id=?');$q->execute([$json,$u['id']]);$db->commit();answer(['revision'=>$version+1]);
 }
 if($action==='publish'){
  write_request('POST');$u=require_user(true);$data=body();$batch=$data['songs']??null;if(!is_array($batch)||count($batch)<1||count($batch)>100)fail(422,'Publish between 1 and 100 charts at a time.');$rows=[];
  foreach($batch as $song){if(!is_array($song))fail(422,'Invalid chart.');$record=chart_record($song);$id=$song['id']??('global:'.substr(hash('sha256',json_encode([$record['title'],$record['composer'],$record['chart']],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)),0,32));if(!is_string($id)||!preg_match('/^[a-zA-Z0-9:_-]{1,160}$/D',$id))fail(422,'Invalid global chart ID.');$record['id']=$id;$rows[]=$record;}
  $db=database();$db->beginTransaction();$db->query("SELECT value FROM jazzbook_meta WHERE name='catalog_revision' FOR UPDATE")->fetchColumn();$seedFile=dirname(__DIR__).'/data/global-songs.json';$seed=is_file($seedFile)?json_decode(file_get_contents($seedFile),true,64,JSON_THROW_ON_ERROR):['songs'=>[]];$ids=[];foreach($seed['songs']??[] as $s)$ids[$s['id']]=true;foreach($db->query('SELECT id FROM jazzbook_global_charts') as $s)$ids[$s['id']]=true;foreach($rows as $s)$ids[$s['id']]=true;if(count($ids)>20000){$db->rollBack();fail(422,'The shared catalog is limited to 20,000 charts.');}$q=$db->prepare('INSERT INTO jazzbook_global_charts(id,payload,updated_by) VALUES (?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_by=VALUES(updated_by),updated_at=CURRENT_TIMESTAMP');foreach($rows as $record)$q->execute([$record['id'],json_encode($record,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$u['id']]);$db->exec("UPDATE jazzbook_meta SET value=value+1 WHERE name='catalog_revision'");$db->commit();answer(['published'=>count($rows),'ids'=>array_column($rows,'id')]);
 }
 fail(404,'Unknown API action.');
} catch (Throwable $e) {
 if(isset($db)&&$db->inTransaction())$db->rollBack();error_log('Jazzbook API: '.$e->getMessage());fail(503,'The account service is temporarily unavailable. Your device copy is safe.');
}
