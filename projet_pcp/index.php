<?php
<?php
$db = new PDO('sqlite:database.sqlite');
$stmt = $db->query("SELECT * FROM v_pcp_complet LIMIT 50");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Gestion PCP</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="container mt-4">
<h1 class="mb-4">Liste des Points de Contrôle</h1>
<a href="ajouter.php" class="btn btn-primary mb-3">Ajouter un PCP</a>
<table class="table table-bordered">
<thead class="table-dark">
<tr>
<?php foreach(array_keys($rows[0]) as $col): ?>
<th><?= htmlspecialchars($col) ?></th>
<?php endforeach; ?>
<th>Actions</th>
</tr>
</thead>
<tbody>
<?php foreach($rows as $row): ?>
<tr>
<?php foreach($row as $val): ?>
<td><?= htmlspecialchars($val) ?></td>
<?php endforeach; ?>
<td>
<a href="modifier.php?id=<?= $row['id_pcp'] ?>" class="btn btn-warning btn-sm">Modifier</a>
<a href="supprimer.php?id=<?= $row['id_pcp'] ?>" class="btn btn-danger btn-sm" onclick="return confirm('Supprimer ?')">Supprimer</a>
</td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
</body>
</html>
