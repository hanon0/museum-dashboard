const column = (key, type = "text", foreignKey) => ({
  k: key,
  ty: type,
  fk: foreignKey,
});

const subtype = (extraColumns) => ({
  pk: ["Art_object_id"],
  cols: [
    column("Art_object_id", "number", ["Art_object", "id"]),
    ...extraColumns,
  ],
});

const employeeRole = (id) => ({
  pk: [id],
  cols: [
    column(id, "number"),
    column("Employee_ssn", "number", ["Employee", "ssn"]),
  ],
});

export const schema = {
  Artist: {
    pk: ["name"],
    cols: [
      column("name"),
      column("country"),
      column("sex"),
      column("birthdata", "date"),
      column("age", "number"),
      column("style"),
      column("century"),
    ],
  },
  Art_object: {
    pk: ["id"],
    cols: [
      column("id", "number"),
      column("price", "number"),
      column("Artist_name", "text", ["Artist", "name"]),
      column("Visitor_ssn", "number", ["Visitor", "ssn"]),
      column("idseller", "number", ["seller", "idseller"]),
    ],
  },
  Painting: subtype([column("Name")]),
  Statue: subtype([
    column("height", "number"),
    column("weight", "number"),
    column("Name"),
  ]),
  Sculpture: subtype([
    column("height", "number"),
    column("weight", "number"),
    column("Name"),
  ]),
  Employee: {
    pk: ["ssn"],
    cols: [
      column("ssn", "number"),
      column("fname"),
      column("Lname"),
      column("sex"),
      column("Bdate", "date"),
      column("address"),
      column("phone_no"),
      column("salary", "number"),
    ],
  },
  Manager: employeeRole("idManager"),
  Security: employeeRole("idSecurity"),
  seller: employeeRole("idseller"),
  Tour_guide: employeeRole("idTour_guide"),
  Visitor: {
    pk: ["ssn"],
    cols: [
      column("ssn", "number"),
      column("fname"),
      column("Lname"),
      column("idguide", "number", ["Tour_guide", "idTour_guide"]),
    ],
  },
  Museum: {
    pk: ["name"],
    cols: [column("name"), column("country")],
  },
  Borrowe_from: {
    pk: ["Museum_name", "Art_object_id", "borrowDate"],
    cols: [
      column("Museum_name", "text", ["Museum", "name"]),
      column("Art_object_id", "number", ["Art_object", "id"]),
      column("borrowDate", "date"),
      column("returnDate", "date"),
    ],
  },
};

export const groups = {
  Collection: ["Artist", "Art_object", "Painting", "Statue", "Sculpture"],
  People: ["Employee", "Manager", "Security", "seller", "Tour_guide", "Visitor"],
  Museums: ["Museum", "Borrowe_from"],
};

export const roles = ["Manager", "Security", "seller", "Tour_guide"];
export const subtypes = ["Painting", "Statue", "Sculpture"];
export const artworkIcons = {
  Painting: "🖼️",
  Statue: "🗿",
  Sculpture: "⚱️",
};
