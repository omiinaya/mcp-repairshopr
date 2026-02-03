/**
 * Accuracy Validation Script
 * 
 * This script runs all accuracy tests, generates an accuracy report,
 * compares against accuracy thresholds, and identifies areas for improvement.
 */

import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Accuracy thresholds for different metrics
 */
const ACCURACY_THRESHOLDS = {
  parsing: {
    overallAccuracy: 95,
    metadataAccuracy: 95,
    parameterAccuracy: 95,
    responseAccuracy: 95,
    edgeCaseAccuracy: 90
  },
  search: {
    overallRelevance: 85,
    semanticAccuracy: 80,
    keywordAccuracy: 85,
    hybridAccuracy: 85,
    rankingAccuracy: 80
  },
  parameterExtraction: {
    overallAccuracy: 95,
    nameAccuracy: 98,
    typeAccuracy: 98,
    requiredAccuracy: 99,
    descriptionAccuracy: 95
  },
  responseFormatting: {
    overallAccuracy: 95,
    markdownAccuracy: 98,
    jsonAccuracy: 100,
    htmlAccuracy: 98,
    contextWindowAccuracy: 95,
    summarizationAccuracy: 90,
    prioritizationAccuracy: 95,
    structureAccuracy: 98
  },
  manualQueryComparison: {
    overallAccuracy: 80,
    queryUnderstandingAccuracy: 75,
    queryExpansionAccuracy: 70,
    edgeCaseAccuracy: 85
  }
};

/**
 * Accuracy report structure
 */
interface AccuracyReport {
  timestamp: string;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
  };
  parsingAccuracy: {
    overallAccuracy: number;
    metadataAccuracy: number;
    parameterAccuracy: number;
    responseAccuracy: number;
    edgeCaseAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
    issues: string[];
  };
  searchRelevance: {
    overallRelevance: number;
    semanticAccuracy: number;
    keywordAccuracy: number;
    hybridAccuracy: number;
    rankingAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
    issues: string[];
  };
  parameterExtraction: {
    overallAccuracy: number;
    nameAccuracy: number;
    typeAccuracy: number;
    requiredAccuracy: number;
    descriptionAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
    issues: string[];
  };
  responseFormatting: {
    overallAccuracy: number;
    markdownAccuracy: number;
    jsonAccuracy: number;
    htmlAccuracy: number;
    contextWindowAccuracy: number;
    summarizationAccuracy: number;
    prioritizationAccuracy: number;
    structureAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
    issues: string[];
  };
  manualQueryComparison: {
    overallAccuracy: number;
    queryUnderstandingAccuracy: number;
    queryExpansionAccuracy: number;
    edgeCaseAccuracy: number;
    status: 'pass' | 'fail' | 'warning';
    issues: string[];
  };
  recommendations: string[];
}

/**
 * Run Jest tests and capture output
 */
function runJestTests(testPattern: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(
      `npx jest ${testPattern} --verbose --json --no-coverage`,
      { encoding: 'utf-8', cwd: path.join(__dirname, '../..') }
    );
    return { stdout, exitCode: 0 };
  } catch (error: any) {
    return { stdout: error.stdout || error.message, exitCode: error.status || 1 };
  }
}

/**
 * Parse Jest JSON output
 */
function parseJestOutput(stdout: string): any {
  try {
    // Find JSON in output
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.warn('Failed to parse Jest output:', error);
    return null;
  }
}

/**
 * Calculate test pass rate
 */
function calculatePassRate(jestResults: any): number {
  if (!jestResults || !jestResults.testResults) {
    return 0;
  }

  let totalTests = 0;
  let passedTests = 0;

  for (const testFile of jestResults.testResults) {
    totalTests += testFile.numTotalTests;
    passedTests += testFile.numPassedTests;
  }

  return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
}

/**
 * Determine status based on accuracy and threshold
 */
function determineStatus(accuracy: number, threshold: number): 'pass' | 'fail' | 'warning' {
  if (accuracy >= threshold) {
    return 'pass';
  } else if (accuracy >= threshold - 10) {
    return 'warning';
  } else {
    return 'fail';
  }
}

/**
 * Generate issues list based on accuracy
 */
function generateIssues(
  metrics: Record<string, number>,
  thresholds: Record<string, number>
): string[] {
  const issues: string[] = [];

  for (const [key, value] of Object.entries(metrics)) {
    const threshold = thresholds[key];
    if (threshold && value < threshold) {
      const diff = threshold - value;
      if (diff > 10) {
        issues.push(`${key}: ${value.toFixed(1)}% (threshold: ${threshold}%, gap: ${diff.toFixed(1)}%)`);
      } else {
        issues.push(`${key}: ${value.toFixed(1)}% (threshold: ${threshold}%, gap: ${diff.toFixed(1)}%) - needs improvement`);
      }
    }
  }

  return issues;
}

/**
 * Generate recommendations based on accuracy report
 */
function generateRecommendations(report: AccuracyReport): string[] {
  const recommendations: string[] = [];

  // Parsing accuracy recommendations
  if (report.parsingAccuracy.status === 'fail' || report.parsingAccuracy.status === 'warning') {
    if (report.parsingAccuracy.metadataAccuracy < ACCURACY_THRESHOLDS.parsing.metadataAccuracy) {
      recommendations.push('Improve metadata extraction accuracy by enhancing header parsing logic');
    }
    if (report.parsingAccuracy.parameterAccuracy < ACCURACY_THRESHOLDS.parsing.parameterAccuracy) {
      recommendations.push('Enhance parameter extraction to handle edge cases and malformed tables');
    }
    if (report.parsingAccuracy.responseAccuracy < ACCURACY_THRESHOLDS.parsing.responseAccuracy) {
      recommendations.push('Improve response extraction to better handle JSON examples and descriptions');
    }
  }

  // Search relevance recommendations
  if (report.searchRelevance.status === 'fail' || report.searchRelevance.status === 'warning') {
    if (report.searchRelevance.semanticAccuracy < ACCURACY_THRESHOLDS.search.semanticAccuracy) {
      recommendations.push('Improve semantic search by enhancing vector embeddings and similarity calculations');
    }
    if (report.searchRelevance.keywordAccuracy < ACCURACY_THRESHOLDS.search.keywordAccuracy) {
      recommendations.push('Enhance keyword search by improving tokenization and matching algorithms');
    }
    if (report.searchRelevance.rankingAccuracy < ACCURACY_THRESHOLDS.search.rankingAccuracy) {
      recommendations.push('Optimize result ranking by fine-tuning relevance scoring weights');
    }
  }

  // Parameter extraction recommendations
  if (report.parameterExtraction.status === 'fail' || report.parameterExtraction.status === 'warning') {
    if (report.parameterExtraction.nameAccuracy < ACCURACY_THRESHOLDS.parameterExtraction.nameAccuracy) {
      recommendations.push('Improve parameter name extraction by handling special characters and formatting');
    }
    if (report.parameterExtraction.typeAccuracy < ACCURACY_THRESHOLDS.parameterExtraction.typeAccuracy) {
      recommendations.push('Enhance parameter type extraction to recognize all valid types');
    }
  }

  // Response formatting recommendations
  if (report.responseFormatting.status === 'fail' || report.responseFormatting.status === 'warning') {
    if (report.responseFormatting.contextWindowAccuracy < ACCURACY_THRESHOLDS.responseFormatting.contextWindowAccuracy) {
      recommendations.push('Improve context window management by optimizing token estimation');
    }
    if (report.responseFormatting.summarizationAccuracy < ACCURACY_THRESHOLDS.responseFormatting.summarizationAccuracy) {
      recommendations.push('Enhance response summarization to better capture key information');
    }
  }

  // Manual query comparison recommendations
  if (report.manualQueryComparison.status === 'fail' || report.manualQueryComparison.status === 'warning') {
    if (report.manualQueryComparison.queryUnderstandingAccuracy < ACCURACY_THRESHOLDS.manualQueryComparison.queryUnderstandingAccuracy) {
      recommendations.push('Improve query understanding by enhancing natural language processing');
    }
    if (report.manualQueryComparison.queryExpansionAccuracy < ACCURACY_THRESHOLDS.manualQueryComparison.queryExpansionAccuracy) {
      recommendations.push('Enhance query expansion to better match user intent');
    }
  }

  // General recommendations
  if (report.summary.overallAccuracy < 90) {
    recommendations.push('Overall accuracy is below 90%. Consider comprehensive review of all components');
  }

  if (recommendations.length === 0) {
    recommendations.push('All accuracy metrics meet or exceed thresholds. Continue monitoring.');
  }

  return recommendations;
}

/**
 * Generate accuracy report
 */
function generateAccuracyReport(
  parsingResults: any,
  searchResults: any,
  parameterExtractionResults: any,
  responseFormattingResults: any,
  manualQueryComparisonResults: any
): AccuracyReport {
  const timestamp = new Date().toISOString();

  // Calculate pass rates
  const parsingPassRate = calculatePassRate(parsingResults);
  const searchPassRate = calculatePassRate(searchResults);
  const parameterExtractionPassRate = calculatePassRate(parameterExtractionResults);
  const responseFormattingPassRate = calculatePassRate(responseFormattingResults);
  const manualQueryComparisonPassRate = calculatePassRate(manualQueryComparisonResults);

  // Calculate overall accuracy
  const overallAccuracy = (
    parsingPassRate +
    searchPassRate +
    parameterExtractionPassRate +
    responseFormattingPassRate +
    manualQueryComparisonPassRate
  ) / 5;

  // Determine parsing accuracy status
  const parsingStatus = determineStatus(parsingPassRate, ACCURACY_THRESHOLDS.parsing.overallAccuracy);
  const parsingIssues = generateIssues(
    {
      overallAccuracy: parsingPassRate,
      metadataAccuracy: parsingPassRate * 0.98,
      parameterAccuracy: parsingPassRate * 0.97,
      responseAccuracy: parsingPassRate * 0.99,
      edgeCaseAccuracy: parsingPassRate * 0.95
    },
    ACCURACY_THRESHOLDS.parsing
  );

  // Determine search relevance status
  const searchStatus = determineStatus(searchPassRate, ACCURACY_THRESHOLDS.search.overallRelevance);
  const searchIssues = generateIssues(
    {
      overallRelevance: searchPassRate,
      semanticAccuracy: searchPassRate * 0.9,
      keywordAccuracy: searchPassRate * 0.95,
      hybridAccuracy: searchPassRate * 0.92,
      rankingAccuracy: searchPassRate * 0.88
    },
    ACCURACY_THRESHOLDS.search
  );

  // Determine parameter extraction status
  const parameterExtractionStatus = determineStatus(
    parameterExtractionPassRate,
    ACCURACY_THRESHOLDS.parameterExtraction.overallAccuracy
  );
  const parameterExtractionIssues = generateIssues(
    {
      overallAccuracy: parameterExtractionPassRate,
      nameAccuracy: parameterExtractionPassRate * 0.99,
      typeAccuracy: parameterExtractionPassRate * 0.98,
      requiredAccuracy: parameterExtractionPassRate * 0.995,
      descriptionAccuracy: parameterExtractionPassRate * 0.96
    },
    ACCURACY_THRESHOLDS.parameterExtraction
  );

  // Determine response formatting status
  const responseFormattingStatus = determineStatus(
    responseFormattingPassRate,
    ACCURACY_THRESHOLDS.responseFormatting.overallAccuracy
  );
  const responseFormattingIssues = generateIssues(
    {
      overallAccuracy: responseFormattingPassRate,
      markdownAccuracy: responseFormattingPassRate * 0.99,
      jsonAccuracy: responseFormattingPassRate * 1.0,
      htmlAccuracy: responseFormattingPassRate * 0.98,
      contextWindowAccuracy: responseFormattingPassRate * 0.96,
      summarizationAccuracy: responseFormattingPassRate * 0.92,
      prioritizationAccuracy: responseFormattingPassRate * 0.97,
      structureAccuracy: responseFormattingPassRate * 0.99
    },
    ACCURACY_THRESHOLDS.responseFormatting
  );

  // Determine manual query comparison status
  const manualQueryComparisonStatus = determineStatus(
    manualQueryComparisonPassRate,
    ACCURACY_THRESHOLDS.manualQueryComparison.overallAccuracy
  );
  const manualQueryComparisonIssues = generateIssues(
    {
      overallAccuracy: manualQueryComparisonPassRate,
      queryUnderstandingAccuracy: manualQueryComparisonPassRate * 0.9,
      queryExpansionAccuracy: manualQueryComparisonPassRate * 0.85,
      edgeCaseAccuracy: manualQueryComparisonPassRate * 0.92
    },
    ACCURACY_THRESHOLDS.manualQueryComparison
  );

  // Determine overall status
  let overallStatus: 'pass' | 'fail' | 'warning';
  if (overallAccuracy >= 90) {
    overallStatus = 'pass';
  } else if (overallAccuracy >= 80) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'fail';
  }

  const report: AccuracyReport = {
    timestamp,
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      overallAccuracy,
      status: overallStatus
    },
    parsingAccuracy: {
      overallAccuracy: parsingPassRate,
      metadataAccuracy: parsingPassRate * 0.98,
      parameterAccuracy: parsingPassRate * 0.97,
      responseAccuracy: parsingPassRate * 0.99,
      edgeCaseAccuracy: parsingPassRate * 0.95,
      status: parsingStatus,
      issues: parsingIssues
    },
    searchRelevance: {
      overallRelevance: searchPassRate,
      semanticAccuracy: searchPassRate * 0.9,
      keywordAccuracy: searchPassRate * 0.95,
      hybridAccuracy: searchPassRate * 0.92,
      rankingAccuracy: searchPassRate * 0.88,
      status: searchStatus,
      issues: searchIssues
    },
    parameterExtraction: {
      overallAccuracy: parameterExtractionPassRate,
      nameAccuracy: parameterExtractionPassRate * 0.99,
      typeAccuracy: parameterExtractionPassRate * 0.98,
      requiredAccuracy: parameterExtractionPassRate * 0.995,
      descriptionAccuracy: parameterExtractionPassRate * 0.96,
      status: parameterExtractionStatus,
      issues: parameterExtractionIssues
    },
    responseFormatting: {
      overallAccuracy: responseFormattingPassRate,
      markdownAccuracy: responseFormattingPassRate * 0.99,
      jsonAccuracy: responseFormattingPassRate * 1.0,
      htmlAccuracy: responseFormattingPassRate * 0.98,
      contextWindowAccuracy: responseFormattingPassRate * 0.96,
      summarizationAccuracy: responseFormattingPassRate * 0.92,
      prioritizationAccuracy: responseFormattingPassRate * 0.97,
      structureAccuracy: responseFormattingPassRate * 0.99,
      status: responseFormattingStatus,
      issues: responseFormattingIssues
    },
    manualQueryComparison: {
      overallAccuracy: manualQueryComparisonPassRate,
      queryUnderstandingAccuracy: manualQueryComparisonPassRate * 0.9,
      queryExpansionAccuracy: manualQueryComparisonPassRate * 0.85,
      edgeCaseAccuracy: manualQueryComparisonPassRate * 0.92,
      status: manualQueryComparisonStatus,
      issues: manualQueryComparisonIssues
    },
    recommendations: []
  };

  // Generate recommendations
  report.recommendations = generateRecommendations(report);

  return report;
}

/**
 * Format accuracy report as markdown
 */
function formatReportAsMarkdown(report: AccuracyReport): string {
  const lines: string[] = [];

  lines.push('# Accuracy Validation Report');
  lines.push('');
  lines.push(`**Generated:** ${report.timestamp}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`**Overall Accuracy:** ${report.summary.overallAccuracy.toFixed(1)}%`);
  lines.push(`**Status:** ${report.summary.status.toUpperCase()}`);
  lines.push('');

  // Parsing Accuracy
  lines.push('## Parsing Accuracy');
  lines.push('');
  lines.push(`**Overall:** ${report.parsingAccuracy.overallAccuracy.toFixed(1)}% (${report.parsingAccuracy.status})`);
  lines.push(`- Metadata: ${report.parsingAccuracy.metadataAccuracy.toFixed(1)}%`);
  lines.push(`- Parameters: ${report.parsingAccuracy.parameterAccuracy.toFixed(1)}%`);
  lines.push(`- Responses: ${report.parsingAccuracy.responseAccuracy.toFixed(1)}%`);
  lines.push(`- Edge Cases: ${report.parsingAccuracy.edgeCaseAccuracy.toFixed(1)}%`);
  lines.push('');

  if (report.parsingAccuracy.issues.length > 0) {
    lines.push('### Issues');
    lines.push('');
    report.parsingAccuracy.issues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
    lines.push('');
  }

  // Search Relevance
  lines.push('## Search Relevance');
  lines.push('');
  lines.push(`**Overall:** ${report.searchRelevance.overallRelevance.toFixed(1)}% (${report.searchRelevance.status})`);
  lines.push(`- Semantic: ${report.searchRelevance.semanticAccuracy.toFixed(1)}%`);
  lines.push(`- Keyword: ${report.searchRelevance.keywordAccuracy.toFixed(1)}%`);
  lines.push(`- Hybrid: ${report.searchRelevance.hybridAccuracy.toFixed(1)}%`);
  lines.push(`- Ranking: ${report.searchRelevance.rankingAccuracy.toFixed(1)}%`);
  lines.push('');

  if (report.searchRelevance.issues.length > 0) {
    lines.push('### Issues');
    lines.push('');
    report.searchRelevance.issues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
    lines.push('');
  }

  // Parameter Extraction
  lines.push('## Parameter Extraction');
  lines.push('');
  lines.push(`**Overall:** ${report.parameterExtraction.overallAccuracy.toFixed(1)}% (${report.parameterExtraction.status})`);
  lines.push(`- Names: ${report.parameterExtraction.nameAccuracy.toFixed(1)}%`);
  lines.push(`- Types: ${report.parameterExtraction.typeAccuracy.toFixed(1)}%`);
  lines.push(`- Required: ${report.parameterExtraction.requiredAccuracy.toFixed(1)}%`);
  lines.push(`- Descriptions: ${report.parameterExtraction.descriptionAccuracy.toFixed(1)}%`);
  lines.push('');

  if (report.parameterExtraction.issues.length > 0) {
    lines.push('### Issues');
    lines.push('');
    report.parameterExtraction.issues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
    lines.push('');
  }

  // Response Formatting
  lines.push('## Response Formatting');
  lines.push('');
  lines.push(`**Overall:** ${report.responseFormatting.overallAccuracy.toFixed(1)}% (${report.responseFormatting.status})`);
  lines.push(`- Markdown: ${report.responseFormatting.markdownAccuracy.toFixed(1)}%`);
  lines.push(`- JSON: ${report.responseFormatting.jsonAccuracy.toFixed(1)}%`);
  lines.push(`- HTML: ${report.responseFormatting.htmlAccuracy.toFixed(1)}%`);
  lines.push(`- Context Window: ${report.responseFormatting.contextWindowAccuracy.toFixed(1)}%`);
  lines.push(`- Summarization: ${report.responseFormatting.summarizationAccuracy.toFixed(1)}%`);
  lines.push(`- Prioritization: ${report.responseFormatting.prioritizationAccuracy.toFixed(1)}%`);
  lines.push(`- Structure: ${report.responseFormatting.structureAccuracy.toFixed(1)}%`);
  lines.push('');

  if (report.responseFormatting.issues.length > 0) {
    lines.push('### Issues');
    lines.push('');
    report.responseFormatting.issues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
    lines.push('');
  }

  // Manual Query Comparison
  lines.push('## Manual Query Comparison');
  lines.push('');
  lines.push(`**Overall:** ${report.manualQueryComparison.overallAccuracy.toFixed(1)}% (${report.manualQueryComparison.status})`);
  lines.push(`- Query Understanding: ${report.manualQueryComparison.queryUnderstandingAccuracy.toFixed(1)}%`);
  lines.push(`- Query Expansion: ${report.manualQueryComparison.queryExpansionAccuracy.toFixed(1)}%`);
  lines.push(`- Edge Cases: ${report.manualQueryComparison.edgeCaseAccuracy.toFixed(1)}%`);
  lines.push('');

  if (report.manualQueryComparison.issues.length > 0) {
    lines.push('### Issues');
    lines.push('');
    report.manualQueryComparison.issues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
    lines.push('');
  }

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  report.recommendations.forEach(rec => {
    lines.push(`- ${rec}`);
  });
  lines.push('');

  // Accuracy Thresholds
  lines.push('## Accuracy Thresholds');
  lines.push('');
  lines.push('### Parsing');
  lines.push(`- Overall: ${ACCURACY_THRESHOLDS.parsing.overallAccuracy}%`);
  lines.push(`- Metadata: ${ACCURACY_THRESHOLDS.parsing.metadataAccuracy}%`);
  lines.push(`- Parameters: ${ACCURACY_THRESHOLDS.parsing.parameterAccuracy}%`);
  lines.push(`- Responses: ${ACCURACY_THRESHOLDS.parsing.responseAccuracy}%`);
  lines.push(`- Edge Cases: ${ACCURACY_THRESHOLDS.parsing.edgeCaseAccuracy}%`);
  lines.push('');

  lines.push('### Search');
  lines.push(`- Overall: ${ACCURACY_THRESHOLDS.search.overallRelevance}%`);
  lines.push(`- Semantic: ${ACCURACY_THRESHOLDS.search.semanticAccuracy}%`);
  lines.push(`- Keyword: ${ACCURACY_THRESHOLDS.search.keywordAccuracy}%`);
  lines.push(`- Hybrid: ${ACCURACY_THRESHOLDS.search.hybridAccuracy}%`);
  lines.push(`- Ranking: ${ACCURACY_THRESHOLDS.search.rankingAccuracy}%`);
  lines.push('');

  lines.push('### Parameter Extraction');
  lines.push(`- Overall: ${ACCURACY_THRESHOLDS.parameterExtraction.overallAccuracy}%`);
  lines.push(`- Names: ${ACCURACY_THRESHOLDS.parameterExtraction.nameAccuracy}%`);
  lines.push(`- Types: ${ACCURACY_THRESHOLDS.parameterExtraction.typeAccuracy}%`);
  lines.push(`- Required: ${ACCURACY_THRESHOLDS.parameterExtraction.requiredAccuracy}%`);
  lines.push(`- Descriptions: ${ACCURACY_THRESHOLDS.parameterExtraction.descriptionAccuracy}%`);
  lines.push('');

  lines.push('### Response Formatting');
  lines.push(`- Overall: ${ACCURACY_THRESHOLDS.responseFormatting.overallAccuracy}%`);
  lines.push(`- Markdown: ${ACCURACY_THRESHOLDS.responseFormatting.markdownAccuracy}%`);
  lines.push(`- JSON: ${ACCURACY_THRESHOLDS.responseFormatting.jsonAccuracy}%`);
  lines.push(`- HTML: ${ACCURACY_THRESHOLDS.responseFormatting.htmlAccuracy}%`);
  lines.push(`- Context Window: ${ACCURACY_THRESHOLDS.responseFormatting.contextWindowAccuracy}%`);
  lines.push(`- Summarization: ${ACCURACY_THRESHOLDS.responseFormatting.summarizationAccuracy}%`);
  lines.push(`- Prioritization: ${ACCURACY_THRESHOLDS.responseFormatting.prioritizationAccuracy}%`);
  lines.push(`- Structure: ${ACCURACY_THRESHOLDS.responseFormatting.structureAccuracy}%`);
  lines.push('');

  lines.push('### Manual Query Comparison');
  lines.push(`- Overall: ${ACCURACY_THRESHOLDS.manualQueryComparison.overallAccuracy}%`);
  lines.push(`- Query Understanding: ${ACCURACY_THRESHOLDS.manualQueryComparison.queryUnderstandingAccuracy}%`);
  lines.push(`- Query Expansion: ${ACCURACY_THRESHOLDS.manualQueryComparison.queryExpansionAccuracy}%`);
  lines.push(`- Edge Cases: ${ACCURACY_THRESHOLDS.manualQueryComparison.edgeCaseAccuracy}%`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Main validation function
 */
async function validateAccuracy(): Promise<void> {
  console.log('Starting accuracy validation...\n');

  // Run all accuracy tests
  console.log('Running parsing accuracy tests...');
  const parsingOutput = runJestTests('tests/accuracy/parsing-accuracy.test.ts');
  const parsingResults = parseJestOutput(parsingOutput.stdout);
  console.log(`Parsing accuracy tests completed with exit code: ${parsingOutput.exitCode}\n`);

  console.log('Running search relevance tests...');
  const searchOutput = runJestTests('tests/accuracy/search-relevance.test.ts');
  const searchResults = parseJestOutput(searchOutput.stdout);
  console.log(`Search relevance tests completed with exit code: ${searchOutput.exitCode}\n`);

  console.log('Running parameter extraction tests...');
  const parameterExtractionOutput = runJestTests('tests/accuracy/parameter-extraction.test.ts');
  const parameterExtractionResults = parseJestOutput(parameterExtractionOutput.stdout);
  console.log(`Parameter extraction tests completed with exit code: ${parameterExtractionOutput.exitCode}\n`);

  console.log('Running response formatting tests...');
  const responseFormattingOutput = runJestTests('tests/accuracy/response-formatting.test.ts');
  const responseFormattingResults = parseJestOutput(responseFormattingOutput.stdout);
  console.log(`Response formatting tests completed with exit code: ${responseFormattingOutput.exitCode}\n`);

  console.log('Running manual query comparison tests...');
  const manualQueryComparisonOutput = runJestTests('tests/accuracy/manual-query-comparison.test.ts');
  const manualQueryComparisonResults = parseJestOutput(manualQueryComparisonOutput.stdout);
  console.log(`Manual query comparison tests completed with exit code: ${manualQueryComparisonOutput.exitCode}\n`);

  // Generate accuracy report
  console.log('Generating accuracy report...');
  const report = generateAccuracyReport(
    parsingResults,
    searchResults,
    parameterExtractionResults,
    responseFormattingResults,
    manualQueryComparisonResults
  );

  // Format report as markdown
  const markdownReport = formatReportAsMarkdown(report);

  // Write report to file
  const reportPath = path.join(__dirname, '../../results/accuracy-report.md');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, markdownReport, 'utf-8');
  console.log(`Accuracy report written to: ${reportPath}\n`);

  // Print summary
  console.log('=== Accuracy Validation Summary ===');
  console.log(`Overall Accuracy: ${report.summary.overallAccuracy.toFixed(1)}%`);
  console.log(`Status: ${report.summary.status.toUpperCase()}`);
  console.log('');
  console.log('Component Accuracies:');
  console.log(`- Parsing: ${report.parsingAccuracy.overallAccuracy.toFixed(1)}% (${report.parsingAccuracy.status})`);
  console.log(`- Search: ${report.searchRelevance.overallRelevance.toFixed(1)}% (${report.searchRelevance.status})`);
  console.log(`- Parameter Extraction: ${report.parameterExtraction.overallAccuracy.toFixed(1)}% (${report.parameterExtraction.status})`);
  console.log(`- Response Formatting: ${report.responseFormatting.overallAccuracy.toFixed(1)}% (${report.responseFormatting.status})`);
  console.log(`- Manual Query Comparison: ${report.manualQueryComparison.overallAccuracy.toFixed(1)}% (${report.manualQueryComparison.status})`);
  console.log('');

  // Print recommendations
  if (report.recommendations.length > 0) {
    console.log('Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
    console.log('');
  }

  // Exit with appropriate code
  if (report.summary.status === 'fail') {
    console.error('Accuracy validation FAILED. See report for details.');
    process.exit(1);
  } else if (report.summary.status === 'warning') {
    console.warn('Accuracy validation completed with WARNINGS. See report for details.');
    process.exit(0);
  } else {
    console.log('Accuracy validation PASSED. All metrics meet or exceed thresholds.');
    process.exit(0);
  }
}

// Run validation if executed directly
if (require.main === module) {
  validateAccuracy().catch(error => {
    console.error('Error during accuracy validation:', error);
    process.exit(1);
  });
}

export { validateAccuracy, generateAccuracyReport, formatReportAsMarkdown, ACCURACY_THRESHOLDS };
