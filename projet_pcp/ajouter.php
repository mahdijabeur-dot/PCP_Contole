<?php
if($_SERVER['REQUEST_METHOD']==='POST'){
    $db=new PDO('sqlite:database.sqlite');
    $stmt=$db->prepare("INSERT INTO pcp_point_controle(code_pcp,description_pcp,id_processus_n1,id_type_controle,id_nature_controle,id_frequence,id_niveau_hier) VALUES(?,?,?,?,?,?,?)");
    $stmt->execute([$_POST['code_pcp'],$_POST['description_pcp'],$_POST['id_processus_n1'],$_POST['id_type_controle'],$_POST['id_nature_controle'],$_POST['id_frequence'],$_POST['id_niveau_hier']]);
    header('Location: index.php');exit;
}
?>
<!DOCTYPE html>
<html><head><title>Ajouter PCP</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"></head>
<body class="container mt-4">
<h1>Ajouter un PCP</h1>
<form method="POST">
<input class="form-control mb-2" name="code_pcp" placeholder="Code PCP" required>
<textarea class="form-control mb-2" name="description_pcp" placeholder="Description" required></textarea>
<input class="form-control mb-2" name="id_processus_n1" placeholder="ID Processus" required>
<input class="form-control mb-2" name="id_type_controle" placeholder="ID Type" required>
<input class="form-control mb-2" name="id_nature_controle" placeholder="ID Nature" required>
<input class="form-control mb-2" name="id_frequence" placeholder="ID Fréquence" required>
<input class="form-control mb-2" name="id_niveau_hier" placeholder="ID Niveau" required>
<button class="btn btn-success">Ajouter</button>
</form>
</body></html>
