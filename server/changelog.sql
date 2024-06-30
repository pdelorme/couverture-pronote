create table eleve (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    eleve char(10),
    classe char(10),
    etablissement varchar(100),
    adresse varchar(100),
)

create table edt (
    eleveId INT,
    date date,
    matiere varchar(30),
    etiquette varchar(30),
    duration decimal,

    FOREIGN KEY (eleveId)
        REFERENCES eleve(id)
        ON DELETE CASCADE
)