Présentation
------------
Ce repos contient une extention Chrome dont le but est de calculer le taux de non-remplacement des cours de votre enfant au travers d'une analyse des données pronote.

Il à été réalisé dans le cadre du hackathon des écoles organisé par le Donut le weekend du 14-15-16 juin 2024.

Installation Utilisateur
--------------
1. allez sur la page https://chromewebstore.google.com/detail/epkkeanibfjhlkoemcdfklbhegljidgd/preview?hl=fr&authuser=0
2. Ajouter à Google Chrome
3. Allez sur pronote et authentifiez vous.
4. sur l'extension "Couverture Pronote", un popup s'affiche.
5. Appuyez sur le bouton "Rafraichir les statistiques"

Installation Developpeur
------------
1. clonez le projet sur votre ordi.
2. dans Chrome, allez à l'adresse suivante : chrome://extensions/
3. Activez le mode developpeur (en haut à droite)
4. Chargez l'extention non-empactée (selectionnez le dossier téléchargé en 1.)

Installation Serveur
------------
1. copier le fichier serveur_module_pronote.php sur votre serveur
2. modifier les informations de connexion à votre base de données
3. exécuter le fichier SQL sur votre base de données pour la mise en place des tables.
 