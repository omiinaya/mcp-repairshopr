# Incident Response Playbook

Quick reference guide for handling production incidents with the MCP RepairShopr Server.

## Incident Severity Levels

### SEV 1 - Critical
- **Definition**: Complete service outage or data loss
- **Response Time**: 15 minutes
- **Examples**: 
  - Server not responding
  - Database corruption
  - Security breach
- **Actions**: Page on-call engineer immediately

### SEV 2 - High
- **Definition**: Major functionality impaired
- **Response Time**: 30 minutes
- **Examples**:
  - High error rate (>10%)
  - Severe performance degradation
  - Partial feature failure
- **Actions**: Page on-call engineer

### SEV 3 - Medium
- **Definition**: Minor functionality issues
- **Response Time**: 2 hours
- **Examples**:
  - Elevated error rate (1-10%)
  - Non-critical features broken
  - Performance slightly degraded
- **Actions**: Create ticket, address during business hours

### SEV 4 - Low
- **Definition**: Cosmetic issues or monitoring gaps
- **Response Time**: Next business day
- **Examples**:
  - Dashboard inaccuracies
  - Missing metrics
  - Documentation issues
- **Actions**: Create ticket

---

## Common Incidents

### 1. Server Not Responding

**Symptoms**: 
- Health checks failing
- Connection timeouts
- 503 errors

**Diagnosis**:
```bash
# Check container status
docker ps | grep mcp-repairshopr

# View logs
docker logs CONTAINER_ID --tail 100

# Check resource usage
docker stats CONTAINER_ID

# Test locally
curl http://localhost:3000/health
```

**Resolution**:
1. Check if container is running: `docker ps`
2. Review logs for errors: `docker logs`
3. Check resource limits (CPU/memory)
4. Restart container if necessary
5. Verify health checks pass

**Prevention**:
- Set appropriate resource limits
- Monitor memory usage
- Implement circuit breakers
- Set up alerting

---

### 2. High Error Rate

**Symptoms**:
- Error rate >5%
- 4xx/5xx responses increasing
- Alert firing

**Diagnosis**:
```bash
# Check error logs
docker logs CONTAINER_ID | grep ERROR

# View metrics
curl http://localhost:3000/admin/performance

# Check RepairShopr API status
curl https://your-subdomain.repairshopr.com/api/v1/ping
```

**Resolution**:
1. Identify error type from logs
2. Check external dependencies (RepairShopr API)
3. Review recent deployments
4. Check for traffic spikes
5. Scale resources if needed

**Common Causes**:
- RepairShopr API down
- Rate limiting exceeded
- Invalid API credentials
- Recent code changes

**Prevention**:
- Implement retry logic
- Use circuit breakers
- Monitor external APIs
- Test before deployment

---

### 3. Slow Response Times

**Symptoms**:
- P95 latency >500ms
- User complaints
- Timeout errors

**Diagnosis**:
```bash
# Check performance metrics
curl http://localhost:3000/admin/performance

# Monitor real-time stats
docker stats CONTAINER_ID

# Check for resource constraints
top -p $(docker inspect -f '{{.State.Pid}}' CONTAINER_ID)
```

**Resolution**:
1. Check CPU/memory usage
2. Review cache hit rates
3. Analyze slow queries/endpoints
4. Check for blocked requests
5. Scale horizontally if needed

**Optimization**:
- Increase cache size
- Optimize database queries
- Add CDN for static assets
- Implement connection pooling

---

### 4. Security Incident

**Symptoms**:
- Unauthorized access attempts
- Suspicious traffic patterns
- Data exfiltration alerts

**Immediate Actions**:
1. **STOP**: Don't panic, follow protocol
2. **CONTAIN**: Isolate affected systems
3. **ASSESS**: Determine scope
4. **RECOVER**: Restore from clean backups
5. **LEARN**: Document and improve

**Investigation Checklist**:
- [ ] Review access logs
- [ ] Check authentication logs
- [ ] Verify API key usage
- [ ] Scan for malware
- [ ] Check for data exfiltration

**Communication**:
1. Notify security team immediately
2. Document all findings
3. Prepare incident report
4. Communicate with stakeholders
5. Coordinate with legal if needed

---

### 5. Circuit Breaker Open

**Symptoms**:
- "Circuit breaker is OPEN" errors
- External API calls failing
- Service degraded but running

**Diagnosis**:
```bash
# Check circuit breaker status
docker logs CONTAINER_ID | grep "Circuit breaker"

# Verify external API
curl https://your-subdomain.repairshopr.com/api/v1/ping

# Check error rates
curl http://localhost:3000/admin/performance
```

**Resolution**:
1. Verify external service status
2. Check network connectivity
3. Review recent changes
4. Wait for automatic recovery (30s timeout)
5. Force close circuit if needed (emergency only)

**Commands**:
```javascript
// Force circuit closed (emergency)
circuitBreakerRegistry.get('repairshopr-api').forceClose();
```

---

### 6. Memory Leak

**Symptoms**:
- Memory usage steadily increasing
- Container OOM killed
- Performance degrading over time

**Diagnosis**:
```bash
# Monitor memory over time
watch -n 5 docker stats CONTAINER_ID

# Check Node.js heap
docker exec CONTAINER_ID node -e "console.log(process.memoryUsage())"

# Profile memory usage
# Enable heap dumps and analyze
```

**Resolution**:
1. Identify leak source from heap dumps
2. Review recent code changes
3. Restart container as temporary fix
4. Deploy fix
5. Monitor for recurrence

**Prevention**:
- Regular memory profiling
- Set memory limits
- Implement health checks
- Monitor heap usage

---

### 7. Database Connection Issues

**Symptoms**:
- Connection timeouts
- "Too many connections" errors
- Query failures

**Diagnosis**:
```bash
# Check connection pool status
# Review connection limits
# Monitor active connections
```

**Resolution**:
1. Check connection pool settings
2. Verify database is accessible
3. Kill idle connections
4. Restart application
5. Scale database if needed

---

## Emergency Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| Primary On-call | [TBD] | Immediate |
| Secondary On-call | [TBD] | 15 minutes |
| Engineering Manager | [TBD] | 30 minutes |
| CTO | [TBD] | 1 hour |

---

## Communication Templates

### Incident Started
```
🚨 INCIDENT: [SEV X] - [Brief Description]

Status: Investigating
Impact: [What's affected]
Started: [Time]
Engineer: [Name]

Updates in #incidents
```

### Status Update
```
📊 UPDATE: [Incident ID]

Status: [Investigating/Identified/Monitoring/Resolved]
Time: [Duration]
Latest: [What's happening now]
Next: [Next steps]
```

### Incident Resolved
```
✅ RESOLVED: [Incident ID]

Duration: [X minutes]
Cause: [Root cause]
Fix: [What was done]
Prevention: [How to prevent recurrence]

Post-mortem: [Link]
```

---

## Post-Incident Review

### Timeline
Document minute-by-minute what happened:
1. [Time] - Incident detected
2. [Time] - Engineer paged
3. [Time] - Issue identified
4. [Time] - Fix applied
5. [Time] - Service restored

### Root Cause Analysis
Use 5 Whys technique:
1. Why did X happen? → Because of Y
2. Why did Y happen? → Because of Z
3. Continue until root cause found

### Action Items
- [ ] Immediate fix (within 24h)
- [ ] Short-term improvement (within 1 week)
- [ ] Long-term prevention (within 1 month)

---

## Run Commands

### Quick Health Check
```bash
curl -s http://localhost:3000/health | jq .
curl -s http://localhost:3000/ready | jq .
curl -s http://localhost:3000/metrics | head -20
```

### View Logs
```bash
# Recent errors
docker logs CONTAINER_ID --tail 100 | grep ERROR

# Follow logs
docker logs CONTAINER_ID -f

# Logs since specific time
docker logs CONTAINER_ID --since 10m
```

### Restart Service
```bash
# Graceful restart
docker restart CONTAINER_ID

# Force restart
docker kill CONTAINER_ID
docker start CONTAINER_ID
```

### Check Metrics
```bash
# Performance metrics
curl http://localhost:3000/admin/performance | jq .

# Prometheus metrics
curl http://localhost:3000/metrics
```

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
