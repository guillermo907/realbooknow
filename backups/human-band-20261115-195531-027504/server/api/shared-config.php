<?php
declare(strict_types=1);
// The calculator's existing runtime.php remains the owner of shared credentials.
function jazzbook_config_values(array $values): array {
    if (isset($values['db_dsn'])) return $values; // Dedicated Jazzbook config still works.
    if (!array_key_exists('DB_USER',$values) || !array_key_exists('GOOGLE_CLIENT_ID',$values)) throw new RuntimeException('Unrecognized shared configuration.');
    $emails=$values['JAZZBOOK_ADMIN_EMAILS']??$values['ADMIN_EMAILS']??'';
    $emails=is_array($emails)?$emails:explode(',',(string)$emails);
    $emails=array_values(array_filter(array_map(static fn($email)=>strtolower(trim((string)$email)),$emails),static fn($email)=>filter_var($email,FILTER_VALIDATE_EMAIL)!==false));
    $dbName=(string)(getenv('JAZZBOOK_DB_NAME')?:($values['JAZZBOOK_DB_NAME']??'guill313_jazzbook'));
    if (!preg_match('/^[a-zA-Z0-9_]+$/D',$dbName)) throw new RuntimeException('Invalid Jazzbook database name.');
    return [
        // APP_URL / DB_NAME belong to the calculator and must not redirect Jazzbook there.
        'base_url'=>getenv('JAZZBOOK_APP_URL')?:($values['JAZZBOOK_APP_URL']??'https://jazzbook.guillermolopez-music.com'),
        'db_dsn'=>'mysql:host='.($values['DB_HOST']??'localhost').';port='.(int)($values['DB_PORT']??3306).';dbname='.$dbName.';charset=utf8mb4',
        'db_user'=>$values['JAZZBOOK_DB_USER']??$values['DB_USER'],
        'db_password'=>$values['JAZZBOOK_DB_PASSWORD']??$values['DB_PASSWORD']??'',
        'google_client_id'=>$values['GOOGLE_CLIENT_ID'],
        'google_client_secret'=>$values['GOOGLE_CLIENT_SECRET']??'',
        'admin_emails'=>$emails,
        'admin_subjects'=>$values['JAZZBOOK_ADMIN_SUBJECTS']??[],
        'session_seconds'=>604800,
        'allow_local_http'=>false,
    ];
}
function jazzbook_shared_config_path(array $roots): ?string {
    foreach(array_unique($roots) as $root){
        if(!is_string($root)||$root===''||basename($root)==='public_html')continue;
        $path=rtrim($root,'/').'/app/calculadora-insulina/backend/config/runtime.php';
        if(is_file($path))return $path;
    }
    return null;
}
