CREATE TABLE `eleve` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `eleveHash` BIGINT NOT NULL,
  `classe` VARCHAR(255) NOT NULL,
  `etablissement` VARCHAR(255) NOT NULL,
  `adresse` VARCHAR(255),
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `slots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `eleve_id` INT NOT NULL,
  `heureDebut` VARCHAR(50) NOT NULL,
  `heureFin` VARCHAR(50),
  `matiere` VARCHAR(255) NOT NULL,
  `etiquette` VARCHAR(255) NOT NULL,
  `duration` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`eleve_id`) REFERENCES `eleve`(`id`)
);
