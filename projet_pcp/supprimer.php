<?php
$db=new PDO('sqlite:database.sqlite');
$id=$_GET['id'];
$stmt=$db->prepare("DELETE FROM pcp_point_controle WHERE id_pcp=?");
$stmt->execute([$id]);
header('Location: index.php');exit;
