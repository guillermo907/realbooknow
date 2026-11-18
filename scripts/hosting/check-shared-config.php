<?php
declare(strict_types=1);
require dirname(__DIR__,2).'/server/api/shared-config.php';
$shared=['APP_URL'=>'https://insulina.example.test','DB_HOST'=>'localhost','DB_PORT'=>3306,'DB_NAME'=>'guill313_insulina','DB_USER'=>'shared_user','DB_PASSWORD'=>'test-only-password','GOOGLE_CLIENT_ID'=>'test-client','GOOGLE_CLIENT_SECRET'=>'test-only-secret','ADMIN_EMAILS'=>'Admin@example.test,other@example.test'];
$c=jazzbook_config_values($shared);
if($c['db_user']!=='shared_user'||$c['db_password']!=='test-only-password'||$c['google_client_id']!=='test-client'||$c['google_client_secret']!=='test-only-secret')throw new Exception('Shared credentials mapping failed');
if(!str_contains($c['db_dsn'],'dbname=guill313_jazzbook;')||str_contains($c['db_dsn'],'guill313_insulina'))throw new Exception('Wrong database');
if($c['base_url']!=='https://jazzbook.guillermolopez-music.com'||$c['admin_emails']!==['admin@example.test','other@example.test'])throw new Exception('Wrong app scope');
$override=jazzbook_config_values([...$shared,'JAZZBOOK_DB_NAME'=>'another_jazzbook','JAZZBOOK_DB_USER'=>'dedicated_user']);if(!str_contains($override['db_dsn'],'dbname=another_jazzbook;')||$override['db_user']!=='dedicated_user')throw new Exception('Override failed');
$native=['base_url'=>'https://test.example','db_dsn'=>'sqlite:test'];if(jazzbook_config_values($native)!==$native)throw new Exception('Native config changed');
$root=sys_get_temp_dir().'/jazzbook-config-check-'.bin2hex(random_bytes(4));$dir=$root.'/app/calculadora-insulina/backend/config';mkdir($dir,0700,true);file_put_contents($dir.'/runtime.php','<?php return [];');try{if(jazzbook_shared_config_path([$root])!==$dir.'/runtime.php')throw new Exception('Discovery failed');}finally{unlink($dir.'/runtime.php');for($p=$dir;$p!==dirname($root);$p=dirname($p))rmdir($p);}
echo "Shared config mapping, discovery, app/database separation and dedicated config compatibility passed.\n";
