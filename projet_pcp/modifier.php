<?php
$db=new PDO('sqlite:database.sqlite');
if($_SERVER['REQUEST_METHOD']==='POST'){
    $stmt=$db->prepare("UPDATE pcp_point_controle SET description_pcp=? WHERE id_pcp=?");
    $stmt->execute([$_POST['description_pcp'],$_POST['id_pcp']]);
    header('Location: index.php');exit;
}
$id=$_GET['id'];
$stmt=$db->prepare("SELECT * FROM pcp_point_controle WHERE id_pcp=?");
$stmt->execute([$id]);
$row=$stmt->fetch(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html><head><title>Modifier PCP</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"></head>
<body class="container mt-4">
<h1>Modifier PCP</h1>
<form method="POST">
<input type="hidden" name="id_pcp" value="<?= $row['id_pcp'] ?>">
<textarea class="form-control mb-2" name="description_pcp"><?= htmlspecialchars($row['description_pcp']) ?></textarea>
<button class="btn btn-warning">Enregistrer</button>
</form>
</body></html>
