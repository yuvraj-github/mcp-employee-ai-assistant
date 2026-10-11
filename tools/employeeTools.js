import db from "../config/db.js";

export async function getEmployeeDetails(employeeId) {
  const [rows] = await db.execute(
    `SELECT
        id,
        name,
        department,
        designation,
        DATE_FORMAT(joining_date, '%Y-%m-%d') AS joining_date
    FROM employees
    WHERE id = ?`,
    [employeeId]
    );

  return rows[0] || null;
}

export async function listEmployees(department) {
  let query = `
    SELECT id, name, department, designation
    FROM employees
  `;

  const params = [];

  if (department) {
    query += " WHERE department = ?";
    params.push(department);
  }

  const [rows] = await db.execute(query, params);

  return rows;
}

export async function countEmployeesByDepartment(department) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM employees
     WHERE department = ?`,
    [department]
  );

  return rows[0];
}

export async function getDepartments() {
  const [rows] = await db.execute(
    `SELECT DISTINCT department
     FROM employees
     ORDER BY department`
  );

  return rows;
}

