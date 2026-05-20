#!/usr/bin/env python3
"""
RepairShopr API Documentation Generator

This script fetches the swagger.json from RepairShopr API documentation
and automatically generates markdown documents for each API section.
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Any
import requests


class RepairShoprDocGenerator:
    """Generate markdown documentation from RepairShopr swagger.json"""

    SWAGGER_URL = "https://api-docs.repairshopr.com/swagger.json"
    OUTPUT_DIR = "docs/api"

    def __init__(self):
        self.swagger_data = None
        self._output_dir = Path(self.OUTPUT_DIR)
        self._output_dir.mkdir(parents=True, exist_ok=True)

    @property
    def output_dir(self):
        return self._output_dir

    def fetch_swagger_json(self) -> bool:
        """Fetch the swagger.json from RepairShopr API docs"""
        print(f"Fetching swagger.json from {self.SWAGGER_URL}...")
        try:
            response = requests.get(self.SWAGGER_URL, timeout=30)
            response.raise_for_status()
            self.swagger_data = response.json()
            print("Successfully fetched swagger.json")
            return True
        except requests.RequestException as e:
            print(f"Error fetching swagger.json: {e}")
            return False

    def parse_swagger(self) -> Dict[str, List[Dict]]:
        """Parse swagger data and organize endpoints by section"""
        if not self.swagger_data:
            return {}

        sections = {}
        paths = self.swagger_data.get("paths", {})

        for path, methods in paths.items():
            for method, details in methods.items():
                if method.upper() not in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
                    continue

                # Extract section name from path
                # e.g., /customer_assets -> Assets
                # e.g., /customers/{id}/contacts -> Contacts
                section_name = self._extract_section_name(path, details)

                if section_name not in sections:
                    sections[section_name] = []

                sections[section_name].append(
                    {"path": path, "method": method.upper(), "details": details}
                )

        return sections

    def _extract_section_name(self, path: str, details: Dict) -> str:
        """Extract section name from path and details"""
        # Try to get tags from details
        tags = details.get("tags", [])
        if tags:
            # Convert tag to title case and singular form
            tag = tags[0]
            return self._format_section_name(tag)

        # Fallback: extract from path
        # Remove leading slash and path parameters
        clean_path = path.lstrip("/").split("{")[0].rstrip("/")

        # Get the first segment (usually the resource name)
        segments = clean_path.split("/")
        if segments:
            resource = segments[0]
            # Convert to title case and singular form
            return self._format_section_name(resource)

        return "API"

    def _format_section_name(self, name: str) -> str:
        """Format section name to title case singular form"""
        # Convert underscores and hyphens to spaces
        name = name.replace("_", " ").replace("-", " ")

        # Title case
        name = name.title()

        # Simple singularization (remove trailing 's' if present)
        if name.endswith("s") and not name.endswith("ss"):
            name = name[:-1]

        return name

    def generate_endpoint_doc(self, endpoint: Dict) -> str:
        """Generate markdown documentation for a single endpoint"""
        path = endpoint["path"]
        method = endpoint["method"]
        details = endpoint["details"]

        # Extract summary and description
        summary = details.get("summary", "")
        description = details.get("description", "")

        # Generate operation name
        operation_name = self._generate_operation_name(method, path, summary)

        # Build markdown
        md = []
        md.append(f"#### {operation_name}\n")
        md.append(f"\n{summary}\n")

        if description:
            md.append(f"\n{description}\n")

        # Endpoint
        md.append(f"\n**Endpoint:** `{method} {path}`\n")

        # Permissions
        permissions = self._extract_permissions(details)
        if permissions:
            md.append(f"\n**Required Permission:** {permissions}\n")

        # Parameters
        parameters = details.get("parameters", [])
        if parameters:
            param_type = self._get_parameter_type(method, path)
            md.append(f"\n**{param_type} Parameters:**\n")
            md.append(self._generate_parameters_table(parameters))

        # Request body for POST/PUT/PATCH
        if method in ["POST", "PUT", "PATCH"]:
            request_body = self._generate_request_body(details)
            if request_body:
                md.append(request_body)

        # Responses
        responses = details.get("responses", {})
        if responses:
            md.append(self._generate_responses(responses))

        return "\n".join(md)

    def _generate_operation_name(self, method: str, path: str, summary: str) -> str:
        """Generate a descriptive operation name"""
        # Extract resource name from path
        clean_path = path.lstrip("/").split("{")[0].rstrip("/")
        segments = clean_path.split("/")

        if len(segments) == 1:
            resource = segments[0]
        else:
            resource = segments[-1]

        # Format resource name
        resource = resource.replace("_", " ").title()

        # Simple singularization
        if resource.endswith("s") and not resource.endswith("ss"):
            resource = resource[:-1]

        # Map method to action
        action_map = {
            "GET": "Get",
            "POST": "Create",
            "PUT": "Update",
            "PATCH": "Update",
            "DELETE": "Delete",
        }

        action = action_map.get(method, method)

        # Check if it's a list/get all operation
        if method == "GET" and "{id}" not in path:
            return f"Get {resource}s"
        elif method == "GET":
            return f"Get {resource} by ID"
        elif method == "POST":
            return f"Create {resource}"
        elif method in ["PUT", "PATCH"]:
            return f"Update {resource}"
        elif method == "DELETE":
            return f"Delete {resource}"

        return f"{action} {resource}"

    def _extract_permissions(self, details: Dict) -> str:
        """Extract permission information from details"""
        # Look for permission info in description or x-permissions
        description = details.get("description", "")
        x_permissions = details.get("x-permissions", "")

        if x_permissions:
            return x_permissions

        # Try to extract from description
        if "permission" in description.lower():
            # Extract permission line
            for line in description.split("\n"):
                if "permission" in line.lower():
                    return line.strip()

        return ""

    def _get_parameter_type(self, method: str, path: str) -> str:
        """Determine parameter type based on method and path"""
        if "{id}" in path or "{" in path:
            return "Path"
        elif method == "GET":
            return "Query"
        else:
            return "Request"

    def _generate_parameters_table(self, parameters: List[Dict]) -> str:
        """Generate markdown table for parameters"""
        md = []
        md.append("\n| Parameter | Type | Required | Description |")
        md.append("|-----------|------|----------|-------------|")

        for param in parameters:
            name = param.get("name", "")
            param_type = param.get(
                "type", param.get("schema", {}).get("type", "string")
            )
            required = "Yes" if param.get("required", False) else "No"
            description = param.get("description", "")

            md.append(f"| {name} | {param_type} | {required} | {description} |")

        return "\n".join(md) + "\n"

    def _generate_request_body(self, details: Dict) -> str:
        """Generate request body documentation"""
        md = []

        # Check for request body in requestBody (OpenAPI 3.0)
        request_body = details.get("requestBody", {})
        if request_body:
            md.append("\n**Request Body:**\n")

            # Extract schema
            content = request_body.get("content", {})
            if content:
                schema = list(content.values())[0].get("schema", {})
                properties = schema.get("properties", {})
                required = schema.get("required", [])

                if properties:
                    md.append("\n| Parameter | Type | Required | Description |")
                    md.append("|-----------|------|----------|-------------|")

                    for prop_name, prop_details in properties.items():
                        prop_type = prop_details.get("type", "string")
                        is_required = "Yes" if prop_name in required else "No"
                        description = prop_details.get("description", "")

                        md.append(
                            f"| {prop_name} | {prop_type} | {is_required} | {description} |"
                        )

                    md.append("\n")

        return "\n".join(md)

    def _generate_responses(self, responses: Dict) -> str:
        """Generate response documentation"""
        md = []

        for status_code, response_details in responses.items():
            md.append(f"\n**Response: {status_code}**\n")

            description = response_details.get("description", "")
            if description:
                md.append(f"\n{description}\n")

            # Try to extract example from schema
            content = response_details.get("content", {})
            if content:
                schema = list(content.values())[0].get("schema", {})
                example = list(content.values())[0].get("example")

                if example:
                    md.append(f"\n```json\n{json.dumps(example, indent=2)}\n```\n")
                elif schema:
                    # Generate example from schema
                    example = self._generate_example_from_schema(schema)
                    if example:
                        md.append(f"\n```json\n{json.dumps(example, indent=2)}\n```\n")

        return "\n".join(md)

    def _generate_example_from_schema(self, schema: Any) -> Any:
        """Generate example JSON from schema"""
        # Handle string schemas (likely $ref references)
        if isinstance(schema, str):
            return schema

        # Handle non-dict schemas
        if not isinstance(schema, dict):
            return None

        schema_type = schema.get("type")

        if schema_type == "object":
            properties = schema.get("properties", {})
            example = {}
            for prop_name, prop_schema in properties.items():
                example[prop_name] = self._generate_example_from_schema(prop_schema)
            return example
        elif schema_type == "array":
            items = schema.get("items", {})
            return [self._generate_example_from_schema(items)]
        elif schema_type == "string":
            return "string"
        elif schema_type == "integer":
            return 0
        elif schema_type == "number":
            return 0.0
        elif schema_type == "boolean":
            return True
        else:
            return None

    def generate_section_doc(self, section_name: str, endpoints: List[Dict]) -> str:
        """Generate markdown documentation for a section"""
        md = []

        # Header
        title = f"# RepairShopr API Documentation - {section_name}"
        md.append(title)
        md.append("")
        md.append(
            "> **Note:** This file was automatically generated from the RepairShopr API swagger.json."
        )
        md.append("")

        # API Endpoints section
        md.append("## API Endpoints")
        md.append("")
        md.append(f"### {section_name}")
        md.append("")

        # Generate docs for each endpoint
        for endpoint in endpoints:
            endpoint_doc = self.generate_endpoint_doc(endpoint)
            md.append(endpoint_doc)
            md.append("")

        return "\n".join(md)

    def generate_all_docs(self):
        """Generate all markdown documentation files"""
        if not self.fetch_swagger_json():
            return False

        sections = self.parse_swagger()

        if not sections:
            print("No sections found in swagger.json")
            return False

        print(f"\nFound {len(sections)} sections:")
        for section_name in sections:
            print(f"  - {section_name} ({len(sections[section_name])} endpoints)")

        # Generate documentation for each section
        for section_name, endpoints in sections.items():
            # Generate filename
            filename = self._generate_filename(section_name)
            filepath = self._output_dir / filename

            # Generate documentation
            doc_content = self.generate_section_doc(section_name, endpoints)

            # Write to file
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(doc_content)

            print(f"Generated: {filepath}")

        # Generate index file
        self._generate_index(sections)

        print(f"\nSuccessfully generated {len(sections)} documentation files!")
        return True

    def _generate_filename(self, section_name: str) -> str:
        """Generate filename from section name"""
        # Convert to lowercase, replace spaces with hyphens
        filename = section_name.lower().replace(" ", "-")
        # Remove special characters
        filename = re.sub(r"[^a-z0-9-]", "", filename)
        return f"{filename}.md"

    def _generate_index(self, sections: Dict[str, List[Dict]]):
        """Generate an index file listing all API sections"""
        md = []
        md.append("# RepairShopr API Documentation")
        md.append("")
        md.append(
            "This documentation is automatically generated from the RepairShopr API swagger.json."
        )
        md.append("")
        md.append("## API Sections")
        md.append("")

        # Sort sections alphabetically
        sorted_sections = sorted(sections.keys())

        for section_name in sorted_sections:
            filename = self._generate_filename(section_name)
            md.append(f"- [{section_name}]({filename})")

        md.append("")

        # Write index file
        index_path = self.output_dir / "index.md"
        with open(index_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md))

        print(f"Generated: {index_path}")


def main():
    """Main entry point"""
    generator = RepairShoprDocGenerator()
    success = generator.generate_all_docs()

    if success:
        print("\n✓ Documentation generation completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Documentation generation failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
