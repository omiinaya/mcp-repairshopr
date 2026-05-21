# UAT Test Scenarios Documentation

## Overview

This document describes the User Acceptance Testing (UAT) test scenarios for the MCP RepairShopR server. These scenarios are designed to validate that the system meets the needs of AI assistants and provides accurate, complete, and useful responses.

## Purpose

The UAT test scenarios serve to:

- Validate that the system works correctly for real-world AI assistant use cases
- Ensure response quality meets acceptance criteria
- Identify edge cases and potential issues
- Collect feedback for continuous improvement
- Verify that the system is ready for production deployment

## Test Scenario Categories

### 1. API Discovery Scenarios

Test scenarios for discovering available API endpoints.

#### DISC-001: Discover all available endpoints

**Description:** AI assistant should be able to discover all available API endpoints.

**Query:** `What endpoints are available?`

**Expected Behavior:**

- Returns list of available endpoints
- Each endpoint has resource name and operation
- Response is clear and easy to understand
- No errors occur during discovery

**Acceptance Criteria:**

- Response includes list of available endpoints
- Each endpoint has resource name and operation
- Response is clear and easy to understand
- No errors occur during discovery

**Priority:** Critical

---

#### DISC-002: Discover endpoints for specific resource

**Description:** AI assistant should discover endpoints for a specific resource.

**Query:** `What endpoints are available for customers?`

**Expected Behavior:**

- Returns only customer-related endpoints
- Endpoints are relevant to the customer resource
- Response is accurate and complete

**Acceptance Criteria:**

- Response includes only customer-related endpoints
- Endpoints are relevant to the customer resource
- Response is accurate and complete

**Priority:** Critical

---

#### DISC-003: Discover endpoints by HTTP method

**Description:** AI assistant should discover endpoints filtered by HTTP method.

**Query:** `What POST endpoints are available?`

**Expected Behavior:**

- Returns only POST endpoints
- All returned endpoints use POST method
- Response is accurate

**Acceptance Criteria:**

- Response includes only POST endpoints
- All returned endpoints use POST method
- Response is accurate

**Priority:** High

---

#### DISC-004: Discover endpoints by permission

**Description:** AI assistant should discover endpoints filtered by permission.

**Query:** `What endpoints require customer.view permission?`

**Expected Behavior:**

- Returns endpoints with customer.view permission
- All returned endpoints have the specified permission
- Permission information is clearly displayed

**Acceptance Criteria:**

- Response includes endpoints with customer.view permission
- All returned endpoints have the specified permission
- Permission information is clearly displayed

**Priority:** High

---

### 2. Parameter Lookup Scenarios

Test scenarios for looking up endpoint parameters.

#### PARAM-001: Lookup parameters for specific endpoint

**Description:** AI assistant should lookup parameters for a specific endpoint.

**Query:** `What parameters does the create customer endpoint require?`

**Expected Behavior:**

- Returns all parameters for the endpoint
- Each parameter has name, type, and required status
- Parameter descriptions are clear
- Required parameters are clearly marked

**Acceptance Criteria:**

- Response includes all parameters for the endpoint
- Each parameter has name, type, and required status
- Parameter descriptions are clear
- Required parameters are clearly marked

**Priority:** Critical

---

#### PARAM-002: Lookup required parameters only

**Description:** AI assistant should identify required parameters.

**Query:** `What are the required parameters for creating a ticket?`

**Expected Behavior:**

- Returns only required parameters
- No optional parameters are included
- Required status is clearly indicated

**Acceptance Criteria:**

- Response includes only required parameters
- No optional parameters are included
- Required status is clearly indicated

**Priority:** Critical

---

#### PARAM-003: Lookup parameter types and constraints

**Description:** AI assistant should provide parameter types and constraints.

**Query:** `What are the types and constraints for customer parameters?`

**Expected Behavior:**

- Returns parameter types
- Constraints (min, max, pattern) are included
- Type information is accurate
- Constraints are clearly explained

**Acceptance Criteria:**

- Response includes parameter types
- Constraints (min, max, pattern) are included
- Type information is accurate
- Constraints are clearly explained

**Priority:** High

---

#### PARAM-004: Lookup body parameters

**Description:** AI assistant should lookup request body parameters.

**Query:** `What body parameters are needed for POST /customers?`

**Expected Behavior:**

- Returns body parameters
- Body parameters are distinguished from query/path parameters
- All body parameters are listed

**Acceptance Criteria:**

- Response includes body parameters
- Body parameters are distinguished from query/path parameters
- All body parameters are listed

**Priority:** High

---

### 3. Response Format Scenarios

Test scenarios for understanding API response formats.

#### RESP-001: Lookup response format for endpoint

**Description:** AI assistant should lookup response format for an endpoint.

**Query:** `What does the customer endpoint return?`

**Expected Behavior:**

- Returns status codes
- Response descriptions are clear
- Response examples are provided if available
- Multiple response codes are listed

**Acceptance Criteria:**

- Response includes status codes
- Response descriptions are clear
- Response examples are provided if available
- Multiple response codes are listed

**Priority:** Critical

---

#### RESP-002: Lookup success response format

**Description:** AI assistant should lookup successful response format.

**Query:** `What does a successful customer creation return?`

**Expected Behavior:**

- Returns 200/201 status code
- Success response example is provided
- Response structure is clear

**Acceptance Criteria:**

- Response includes 200/201 status code
- Success response example is provided
- Response structure is clear

**Priority:** Critical

---

#### RESP-003: Lookup error response formats

**Description:** AI assistant should lookup error response formats.

**Query:** `What error responses can the customer endpoint return?`

**Expected Behavior:**

- Returns error status codes
- Error response examples are provided
- Error messages are clear
- All possible error codes are listed

**Acceptance Criteria:**

- Response includes error status codes
- Error response examples are provided
- Error messages are clear
- All possible error codes are listed

**Priority:** High

---

#### RESP-004: Lookup response by status code

**Description:** AI assistant should lookup response format by status code.

**Query:** `What does a 404 response look like for customers?`

**Expected Behavior:**

- Returns 404 status code
- 404 response example is provided
- Error message is clear

**Acceptance Criteria:**

- Response includes 404 status code
- 404 response example is provided
- Error message is clear

**Priority:** Medium

---

### 4. Permission Checking Scenarios

Test scenarios for checking endpoint permissions.

#### PERM-001: Check endpoint permissions

**Description:** AI assistant should check permissions for an endpoint.

**Query:** `What permissions are required for customer endpoints?`

**Expected Behavior:**

- Returns required permissions
- Permissions are clearly listed
- Permission format is correct (resource.action)

**Acceptance Criteria:**

- Response includes required permissions
- Permissions are clearly listed
- Permission format is correct (resource.action)

**Priority:** Critical

---

#### PERM-002: Check permissions by resource

**Description:** AI assistant should check permissions for all endpoints of a resource.

**Query:** `What permissions do I need for ticket operations?`

**Expected Behavior:**

- Returns all ticket-related permissions
- Permissions are grouped by operation
- All required permissions are listed

**Acceptance Criteria:**

- Response includes all ticket-related permissions
- Permissions are grouped by operation
- All required permissions are listed

**Priority:** High

---

#### PERM-003: Check if specific permission exists

**Description:** AI assistant should check if a specific permission is required.

**Query:** `Do I need customer.view permission to get customers?`

**Expected Behavior:**

- Confirms or denies permission requirement
- Answer is clear and direct
- Relevant endpoints are listed

**Acceptance Criteria:**

- Response confirms or denies permission requirement
- Answer is clear and direct
- Relevant endpoints are listed

**Priority:** Medium

---

### 5. Code Example Generation Scenarios

Test scenarios for generating code examples.

#### CODE-001: Generate code example for endpoint

**Description:** AI assistant should generate code example for an endpoint.

**Query:** `Show me how to create a customer`

**Expected Behavior:**

- Returns code example
- Code example is syntactically correct
- Code example includes all required parameters
- Code example is well-formatted

**Acceptance Criteria:**

- Response includes code example
- Code example is syntactically correct
- Code example includes all required parameters
- Code example is well-formatted

**Priority:** Critical

---

#### CODE-002: Generate code example with specific language

**Description:** AI assistant should generate code example in a specific language.

**Query:** `Show me how to get a customer in JavaScript`

**Expected Behavior:**

- Returns JavaScript code example
- Code example is valid JavaScript
- Code example uses appropriate libraries

**Acceptance Criteria:**

- Response includes JavaScript code example
- Code example is valid JavaScript
- Code example uses appropriate libraries

**Priority:** High

---

#### CODE-003: Generate code example with all parameters

**Description:** AI assistant should generate code example with all parameters.

**Query:** `Show me a complete example for creating a ticket`

**Expected Behavior:**

- Returns all parameters
- Optional parameters are included with default values
- Code example is complete and runnable

**Acceptance Criteria:**

- Response includes all parameters
- Optional parameters are included with default values
- Code example is complete and runnable

**Priority:** High

---

#### CODE-004: Generate code example with error handling

**Description:** AI assistant should generate code example with error handling.

**Query:** `Show me how to handle errors when creating a customer`

**Expected Behavior:**

- Returns error handling code
- Common error cases are handled
- Error messages are logged appropriately

**Acceptance Criteria:**

- Response includes error handling code
- Common error cases are handled
- Error messages are logged appropriately

**Priority:** Medium

---

### 6. Error Handling Scenarios

Test scenarios for error handling.

#### ERR-001: Handle invalid resource query

**Description:** AI assistant should handle queries for non-existent resources.

**Query:** `What endpoints are available for nonexistent?`

**Expected Behavior:**

- Indicates resource not found
- Error message is clear and helpful
- Suggestion is provided if possible

**Acceptance Criteria:**

- Response indicates resource not found
- Error message is clear and helpful
- Suggestion is provided if possible

**Priority:** High

---

#### ERR-002: Handle ambiguous query

**Description:** AI assistant should handle ambiguous queries.

**Query:** `get`

**Expected Behavior:**

- Returns multiple possible endpoints
- Options are clearly presented
- User is asked to clarify if needed

**Acceptance Criteria:**

- Response includes multiple possible endpoints
- Options are clearly presented
- User is asked to clarify if needed

**Priority:** Medium

---

#### ERR-003: Handle empty query

**Description:** AI assistant should handle empty queries gracefully.

**Query:** ``

**Expected Behavior:**

- Indicates empty query
- Helpful message is provided
- Suggestions are given for valid queries

**Acceptance Criteria:**

- Response indicates empty query
- Helpful message is provided
- Suggestions are given for valid queries

**Priority:** Medium

---

### 7. Edge Case Scenarios

Test scenarios for edge cases.

#### EDGE-001: Handle very long query

**Description:** AI assistant should handle very long queries.

**Query:** `a` repeated 1000 times

**Expected Behavior:**

- Handles long query gracefully
- Error message is clear if query is too long
- System remains stable

**Acceptance Criteria:**

- Response handles long query gracefully
- Error message is clear if query is too long
- System remains stable

**Priority:** Low

---

#### EDGE-002: Handle special characters in query

**Description:** AI assistant should handle special characters in queries.

**Query:** `!!!@#$%`

**Expected Behavior:**

- Handles special characters gracefully
- No crashes or errors occur
- Helpful message is provided

**Acceptance Criteria:**

- Response handles special characters gracefully
- No crashes or errors occur
- Helpful message is provided

**Priority:** Low

---

#### EDGE-003: Handle complex nested path query

**Description:** AI assistant should handle complex nested path queries.

**Query:** `GET /customers/{id}/tickets/{ticket_id}/comments`

**Expected Behavior:**

- Handles nested paths correctly
- Path parameters are identified
- Response is accurate

**Acceptance Criteria:**

- Response handles nested paths correctly
- Path parameters are identified
- Response is accurate

**Priority:** Medium

---

## Sample Queries

The following sample queries are used for testing:

1. `How do I get a list of all customers?`
2. `I need to create a new customer`
3. `What parameters do I need to create a ticket?`
4. `Show me how to update a customer`
5. `How do I delete a ticket?`
6. `Search for customers by name`
7. `What endpoints are available for invoices?`
8. `Get ticket by ID`
9. `What permissions do I need to view customers?`
10. `Create an invoice for a customer`
11. `Get all tickets with status open`
12. `What does the customer endpoint return?`
13. `Show me code example for creating a ticket`
14. `How do I get paginated results?`
15. `What error responses can occur?`

## Acceptance Criteria Summary

### General Acceptance Criteria

All test scenarios must meet the following general acceptance criteria:

1. **Accuracy**: Responses must be factually correct and match the API documentation
2. **Completeness**: Responses must include all relevant information for the query
3. **Clarity**: Responses must be easy to understand and well-structured
4. **Usefulness**: Responses must provide actionable information to the AI assistant
5. **Performance**: Responses must be returned within acceptable time limits (typically < 5 seconds)

### Quality Thresholds

- **Minimum Accuracy**: 85%
- **Minimum Completeness**: 80%
- **Minimum Clarity**: 85%
- **Minimum Usefulness**: 80%
- **Minimum Overall Quality**: 82%

### Pass/Fail Criteria

A test scenario is considered **PASSED** if:

- All acceptance criteria for the scenario are met
- Response quality meets or exceeds the minimum thresholds
- No errors or exceptions occur during execution
- Response is returned within acceptable time limits

A test scenario is considered **FAILED** if:

- Any acceptance criterion is not met
- Response quality falls below minimum thresholds
- Errors or exceptions occur during execution
- Response times exceed acceptable limits

## Feedback Collection Process

### Automated Feedback

The UAT runner automatically collects feedback based on:

- Test pass/fail rates
- Response quality metrics
- Performance metrics
- Error patterns

### Manual Feedback

For comprehensive UAT, manual feedback should be collected from:

1. **AI Assistant Developers**: Evaluate how well the system supports AI assistant development
2. **API Consumers**: Evaluate the usefulness of responses for real-world use cases
3. **Quality Assurance Teams**: Evaluate the overall quality and reliability of responses

### Feedback Categories

Feedback is categorized as:

- **Positive**: Things that work well
- **Negative**: Issues or problems encountered
- **Suggestion**: Ideas for improvement

### Feedback Submission

Feedback can be submitted through:

1. Automated UAT reports
2. Issue tracking systems
3. Direct communication with the development team
4. Feedback forms or surveys

## Running UAT Tests

### Prerequisites

- Node.js and npm installed
- MCP server initialized with test data
- Jest testing framework configured

### Running All UAT Tests

```bash
npm run test:uat
```

### Running Specific Test Suites

```bash
# Run sample query tests
npm run test:uat -- sample-queries

# Run response quality tests
npm run test:uat -- response-quality

# Run edge case tests
npm run test:uat -- edge-cases
```

### Generating UAT Report

```bash
npm run uat:report
```

This will generate:

- `results/uat-report.json`: Detailed JSON report
- `results/uat-report.md`: Human-readable markdown report

## UAT Report Structure

The UAT report includes:

1. **Summary**: Overall test results and metrics
2. **Quality Metrics**: Accuracy, completeness, clarity, usefulness scores
3. **Test Suites**: Detailed results for each test suite
4. **Issues**: List of identified issues with severity levels
5. **Feedback**: Collected feedback from testing
6. **Recommendations**: Actionable recommendations for improvement

## Continuous Improvement

UAT is an ongoing process. The following practices ensure continuous improvement:

1. **Regular UAT Runs**: Schedule regular UAT runs (e.g., weekly, before releases)
2. **Trend Analysis**: Track quality metrics over time to identify trends
3. **Issue Tracking**: Track and prioritize issues identified during UAT
4. **Feedback Integration**: Incorporate feedback into development backlog
5. **Threshold Adjustments**: Adjust quality thresholds based on business needs

## Contact

For questions or issues related to UAT, contact the development team or open an issue in the project repository.
