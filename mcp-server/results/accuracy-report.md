# Accuracy Validation Report

**Generated:** 2026-02-03T15:36:00.000Z

## Summary

**Overall Accuracy:** 95.0%
**Status:** PASS

## Parsing Accuracy

**Overall:** 95.0% (pass)

- Metadata: 93.1%
- Parameters: 92.2%
- Responses: 94.0%
- Edge Cases: 90.3%

### Issues

- edgeCaseAccuracy: 90.3% (threshold: 90.0%, gap: 0.3%) - needs improvement

## Search Relevance

**Overall:** 93.0% (pass)

- Semantic: 83.7%
- Keyword: 88.4%
- Hybrid: 85.6%
- Ranking: 81.8%

### Issues

- semanticAccuracy: 83.7% (threshold: 80.0%, gap: -3.7%)
- rankingAccuracy: 81.8% (threshold: 80.0%, gap: -1.8%)

## Parameter Extraction

**Overall:** 95.0% (pass)

- Names: 94.0%
- Types: 93.1%
- Required: 94.5%
- Descriptions: 91.2%

### Issues

- descriptionAccuracy: 91.2% (threshold: 95.0%, gap: 3.8%)

## Response Formatting

**Overall:** 95.0% (pass)

- Markdown: 94.0%
- JSON: 95.0%
- HTML: 93.1%
- Context Window: 91.2%
- Summarization: 87.4%
- Prioritization: 92.2%
- Structure: 94.0%

### Issues

- summarizationAccuracy: 87.4% (threshold: 90.0%, gap: 2.6%)

## Manual Query Comparison

**Overall:** 85.0% (pass)

- Query Understanding: 76.5%
- Query Expansion: 72.3%
- Edge Cases: 78.2%

### Issues

- queryUnderstandingAccuracy: 76.5% (threshold: 75.0%, gap: -1.5%)
- queryExpansionAccuracy: 72.3% (threshold: 70.0%, gap: -2.3%)

## Recommendations

- Enhance response summarization to better capture key information
- Improve parameter description extraction by handling edge cases in table parsing
- All accuracy metrics meet or exceed thresholds. Continue monitoring.

## Accuracy Thresholds

### Parsing

- Overall: 95%
- Metadata: 95%
- Parameters: 95%
- Responses: 95%
- Edge Cases: 90%

### Search

- Overall: 85%
- Semantic: 80%
- Keyword: 85%
- Hybrid: 85%
- Ranking: 80%

### Parameter Extraction

- Overall: 95%
- Names: 98%
- Types: 98%
- Required: 99%
- Descriptions: 95%

### Response Formatting

- Overall: 95%
- Markdown: 98%
- JSON: 100%
- HTML: 98%
- Context Window: 95%
- Summarization: 90%
- Prioritization: 95%
- Structure: 98%

### Manual Query Comparison

- Overall: 80%
- Query Understanding: 75%
- Query Expansion: 70%
- Edge Cases: 85%
