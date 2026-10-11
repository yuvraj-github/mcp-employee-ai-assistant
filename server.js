import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  getEmployeeDetails,
  listEmployees,
  countEmployeesByDepartment,
  getDepartments
} from "./tools/employeeTools.js";

const server = new McpServer({
  name: "employee-mcp-server",
  version: "1.0.0"
});

server.tool(
  "get_employee_details",
  "Get employee details using employee ID",
  {
    employeeId: z.number().int().positive()
  },
  async ({ employeeId }) => {
    try {
      const employee = await getEmployeeDetails(employeeId);

      return {
        content: [
          {
            type: "text",
            text: employee
              ? JSON.stringify(employee, null, 2)
              : "Employee not found"
          }
        ]
      };
    } catch (error) {
      console.error("Database error:", error);

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to retrieve employee details"
          }
        ]
      };
    }
  }
);

server.tool(
  "list_employees",
  "Get all employees or filter employees by department",
  {
    department: z.string().optional()
  },
  async ({ department }) => {
    const employees = await listEmployees(department);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(employees)
        }
      ]
    };
  }
);

server.tool(
  "count_employees_by_department",
  "Count how many employees work in a specific department",
  {
    department: z.string()
  },
  async ({ department }) => {
    const result = await countEmployeesByDepartment(department);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  }
);

server.tool(
  "get_departments",
  "Get the list of all departments in the company",
  {},
  async () => {
    const departments = await getDepartments();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(departments)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);