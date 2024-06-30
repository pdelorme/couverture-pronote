<?php
// Configurations de la base de données
$host = '';
$dbname = '';
$user = '';
$pass = '';

header('Content-Type: application/json');

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur de connexion à la base de données : ' . $e->getMessage()]);
    exit();
}

// Récupération des données JSON envoyées en POST
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    try {
        // Début de la transaction
        $pdo->beginTransaction();

        // Préparation et exécution de la requête d'insertion pour les informations de l'élève
        $query = "INSERT INTO eleve (eleveHash, classe, etablissement, adresse, date) VALUES (:eleveHash, :classe, :etablissement, :adresse, :date)";
        $stmt = $pdo->prepare($query);
		$DateMySql = date_format(date_create_from_format('d/m/Y', $data['date']), 'Y-m-d');
        $stmt->execute([
            ':eleveHash' => $data['eleveHash'],
            ':classe' => $data['classe'],
            ':etablissement' => $data['etablissement'],
            ':adresse' => $data['adresse'],
            ':date' => $DateMySql
        ]);

        // Récupération de l'ID de l'élève inséré
        $eleveId = $pdo->lastInsertId();

        // Préparation de la requête d'insertion pour les créneaux horaires (slots)
        $query = "INSERT INTO slots (eleve_id, heureDebut, heureFin, matiere, etiquette, duration) VALUES (:eleve_id, :heureDebut, :heureFin, :matiere, :etiquette, :duration)";
        $stmt = $pdo->prepare($query);

        // Boucle d'insertion pour chaque créneau horaire
        foreach ($data['slots'] as $slot) {
            $stmt->execute([
                ':eleve_id' => $eleveId,
                ':heureDebut' => $slot['heureDebut'],
                ':heureFin' => $slot['heureFin'],
                ':matiere' => $slot['matiere'],
                ':etiquette' => $slot['etiquette'],
                ':duration' => $slot['duration']
            ]);
        }

        // Validation de la transaction
        $pdo->commit();

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Données insérées avec succès.']);
    } catch (PDOException $e) {
        // Annulation de la transaction en cas d'erreur
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'insertion des données : ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Données JSON invalides.']);
}
?>

