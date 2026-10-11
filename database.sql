CREATE TABLE IF NOT EXISTS employees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  joining_date DATE NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO employees (id, name, department, designation, joining_date)
VALUES
  (1, 'Alex Morgan', 'IT', 'Systems Analyst', '2021-04-12'),
  (2, 'Jamie Rivera', 'Human Resources', 'HR Coordinator', '2022-08-01'),
  (3, 'Taylor Chen', 'IT', 'Software Engineer', '2020-11-16'),
  (4, 'Riley Patel', 'Finance', 'Financial Analyst', '2023-02-06'),
  (5, 'Casey Brooks', 'Sales', 'Account Executive', '2019-09-23');
