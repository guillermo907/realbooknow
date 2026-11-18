<?php
declare(strict_types=1);
const JAZZBOOK_MAX_BODY = 5242880;
function answer(array $value, int $status = 200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR); exit;
}
function fail(int $status, string $message): never { answer(['error'=>$message],$status); }
function config(): ?array {
    static $loaded = false, $value = null;
    if (!$loaded) {
        $loaded = true;
        $path = getenv('JAZZBOOK_CONFIG') ?: (is_file(__DIR__.'/config-path.php') ? require __DIR__.'/config-path.php' : ($_SERVER['HOME'] ?? getenv('HOME') ?: '') . '/jazzbook-private/config.php');
        if (is_file($path)) $value = require $path;
    }
    return is_array($value) ? $value : null;
}
function database(): PDO {
    static $pdo;
    if (!$pdo) { $c=config(); if (!$c) fail(503,'Server setup is not complete.');
        $pdo=new PDO($c['db_dsn'],$c['db_user'],$c['db_password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]); }
    return $pdo;
}
function base_url(): string {
    $c=config(); $url=rtrim($c['base_url']??'', '/');$parts=parse_url($url);
    $local=in_array($parts['host']??'', ['localhost','127.0.0.1'],true)&&($c['allow_local_http']??false);
    if (!$parts || isset($parts['query']) || isset($parts['fragment']) || isset($parts['user']) || (!$local&&($parts['scheme']??'')!=='https')) fail(503,'Invalid server URL configuration.');
    return $url;
}
function start_session(): void {
    $c=config();$path=(parse_url(base_url(),PHP_URL_PATH)?:'').'/';
    ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
    ini_set('session.gc_maxlifetime',(string)($c['session_seconds']??604800));
    session_name('JazzbookSession');
    session_set_cookie_params(['lifetime'=>$c['session_seconds']??604800,'path'=>$path,'secure'=>str_starts_with(base_url(),'https://'),'httponly'=>true,'samesite'=>'Lax']);
    session_start();
    if (isset($_SESSION['expires']) && $_SESSION['expires']<time()) {$_SESSION=[];session_regenerate_id(true);}
    $_SESSION['csrf']??=bin2hex(random_bytes(32));
}
function user(): ?array {
    if (!isset($_SESSION['user_id'])) return null;
    $q=database()->prepare('SELECT id,google_sub,email,display_name FROM jazzbook_users WHERE id=?');$q->execute([$_SESSION['user_id']]);$row=$q->fetch(PDO::FETCH_ASSOC);if (!$row)return null;
    $c=config();$admin=in_array($row['google_sub'],$c['admin_subjects']??[],true)||in_array(strtolower($row['email']),array_map('strtolower',$c['admin_emails']??[]),true);
    return ['id'=>(int)$row['id'],'cacheKey'=>hash('sha256',$row['google_sub']),'name'=>$row['display_name'],'email'=>$row['email'],'admin'=>$admin];
}
function require_user(bool $admin=false): array { $u=user();if (!$u)fail(401,'Sign in with Google first.');if($admin&&!$u['admin'])fail(403,'Only an administrator can publish global charts.');return $u; }
function write_request(string $method): void {
    if (($_SERVER['REQUEST_METHOD']??'')!==$method) {header('Allow: '.$method);fail(405,'Method not allowed.');}
    $base=parse_url(base_url());$origin=$base['scheme'].'://'.$base['host'].(isset($base['port'])?':'.$base['port']:'');
    if (isset($_SERVER['HTTP_ORIGIN'])&&$_SERVER['HTTP_ORIGIN']!==$origin)fail(403,'Origin rejected.');
    $csrf=$_SERVER['HTTP_X_CSRF_TOKEN']??'';if(!is_string($csrf)||!hash_equals($_SESSION['csrf'],$csrf))fail(403,'Session expired. Reload and retry.');
    if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE']??''),'application/json'))fail(415,'Send application/json.');
}
function body(): array {
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>JAZZBOOK_MAX_BODY)fail(413,'Request exceeds 5 MB.');
    $raw=file_get_contents('php://input',false,null,0,JAZZBOOK_MAX_BODY+1);if(strlen($raw)>JAZZBOOK_MAX_BODY)fail(413,'Request exceeds 5 MB.');
    try {$value=json_decode($raw,true,64,JSON_THROW_ON_ERROR);}catch(JsonException){fail(400,'Invalid JSON.');}
    if(!is_array($value))fail(400,'Expected a JSON object.');return $value;
}
function bounded_string(mixed $v,int $max,string $name,bool $required=false): string {
    if(!is_string($v)||strlen($v)>$max||($required&&trim($v)===''))fail(422,'Invalid '.$name.'.');return $v;
}
function chart_record(array $song): array {
    $out=[];foreach(['title'=>1000,'composer'=>1000,'style'=>200,'key'=>30,'chart'=>200000] as $name=>$limit)$out[$name]=bounded_string($song[$name]??($name==='chart'?null:''),$limit,$name,in_array($name,['title','chart'],true));
    foreach(['tempo'=>[40,360,120],'choruses'=>[1,100,3]] as $key=>$range){$v=$song[$key]??$range[2];if(!is_numeric($v)||$v<$range[0]||$v>$range[1])fail(422,'Invalid '.$key.'.');$out[$key]=(int)$v;}
    if(isset($song['meter'])){if(!is_array($song['meter'])||count($song['meter'])!==2||!is_int($song['meter'][0])||!is_int($song['meter'][1])||$song['meter'][0]<1||$song['meter'][0]>32||!in_array($song['meter'][1],[2,4,8,16],true))fail(422,'Invalid meter.');$out['meter']=$song['meter'];}
    return $out;
}
function library_record(array $data): array {
    if(($data['schemaVersion']??null)!==2)fail(422,'Unsupported library version.');
    foreach(['userSongs'=>20000,'playlists'=>2000,'folders'=>2000,'globalPreferences'=>20000] as $key=>$max)if(!isset($data[$key])||!is_array($data[$key])||count($data[$key])>$max)fail(422,'Invalid '.$key.'.');
    $ids=[];foreach($data['userSongs'] as &$s){if(!is_array($s))fail(422,'Invalid personal song.');chart_record($s);$id=bounded_string($s['id']??null,160,'song ID',true);if(isset($ids[$id]))fail(422,'Duplicate song ID.');$ids[$id]=true;$s['scope']='user';unset($s['ownerId'],$s['userId']);}unset($s);
    foreach($data['playlists'] as $p){if(!is_array($p))fail(422,'Invalid playlist.');bounded_string($p['id']??null,160,'playlist ID',true);bounded_string($p['name']??null,1000,'playlist name',true);if(!isset($p['songIds'])||!is_array($p['songIds'])||count($p['songIds'])>20000)fail(422,'Invalid playlist songs.');foreach($p['songIds'] as $id)bounded_string($id,160,'playlist song ID',true);}
    foreach($data['folders'] as $f){if(!is_array($f))fail(422,'Invalid folder.');bounded_string($f['id']??null,160,'folder ID',true);bounded_string($f['name']??null,1000,'folder name',true);}
    return array_intersect_key($data,array_flip(['schemaVersion','userSongs','playlists','folders','globalPreferences']));
}
function google_json(string $url,?array $post=null,?string $token=null): array {
    $curl=curl_init($url);$headers=['Accept: application/json'];if($token!==null)$headers[]='Authorization: Bearer '.$token;
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>25,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_HTTPHEADER=>$headers,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2]);
    if($post!==null)curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>http_build_query($post)]);
    $text=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE);curl_close($curl);
    if($text===false||$status!==200)throw new RuntimeException('Google sign-in could not be completed.');$value=json_decode($text,true,32,JSON_THROW_ON_ERROR);if(!is_array($value))throw new RuntimeException('Invalid Google response.');return $value;
}
