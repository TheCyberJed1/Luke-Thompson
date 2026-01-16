# Incident Writeup: Authentication Brute Force Detection

**Alert ID**: SEC-2025-0847  
**Detection Date**: 2025-08-15 14:32 UTC  
**Analyst**: Luke Thompson  
**Status**: Resolved  

---

## Alert Overview

A SIEM alert was triggered for excessive failed authentication attempts on a domain-joined workstation. The alert threshold was configured to trigger on 10 failed login attempts within a 5-minute window.

**Alert Details:**
- **Source Host**: WORKSTATION-042 (192.168.1.105)
- **Target Host**: Domain Controller (DC-01)
- **Alert Rule**: "Brute Force Detection - Multiple Failed Authentications"
- **Severity**: Medium
- **User Account Targeted**: administrator

---

## Evidence Reviewed

1. **Windows Event Logs** (Security Event ID 4625 - Failed Login)
2. **SIEM Dashboard Correlation**: 47 failed authentication attempts across 8-minute window
3. **Network Traffic Analysis**: Source IP patterns and geographic location data
4. **Host-Based Logs**: Local event logs from the source workstation

---

## Log Analysis

### Timeline of Events

| Timestamp (UTC) | Event | Source IP | Count | Status |
|---|---|---|---|---|
| 2025-08-15 14:24:30 | First failed login attempt | 192.168.1.105 | 1 | FP Analysis |
| 2025-08-15 14:25:15 | Failed login attempts spike | 192.168.1.105 | 15 | Suspicious |
| 2025-08-15 14:26:45 | Continued failed attempts | 192.168.1.105 | 18 | Alert threshold exceeded |
| 2025-08-15 14:27:20 | Event Viewer error | WORKSTATION-042 | - | Root cause identified |

### Key Findings

- All failed attempts originated from the same internal workstation
- No successful authentication attempts were recorded for the "administrator" account
- The source IP (192.168.1.105) resolved to WORKSTATION-042, registered to user John Doe
- Failed login attempts ceased after 14:27:45 UTC
- No lateral movement or privilege escalation detected following the failed attempts

### Log Evidence

```
Event ID: 4625
Computer: DC-01
User: NT AUTHORITY\SYSTEM
Source Workstation: WORKSTATION-042
Logon Type: 3 (Network)
Failure Code: 0xC000006E (Account locked out)
Failure Reason: User account locked
Account Name: administrator
```

---

## MITRE ATT&CK Mapping

| Tactic | Technique | ID | Status |
|---|---|---|---|
| Credential Access | Brute Force | T1110.001 | Detected |
| - | Password Guessing | T1110.001 | Suspected |

**Framework Relevance**: This attack pattern aligns with the initial access phase of credential compromise attacks, typically used by threat actors to establish persistence.

---

## OSINT Enrichment

- **Workstation Registration**: WORKSTATION-042 is assigned to John Doe (IT Department)
- **Geographic Analysis**: Internal IP, no external threat intelligence indicators
- **Active Directory Lookup**: Account "administrator" is a privileged administrative account
- **Recent Changes**: No recent password changes to the administrator account (last changed 180 days ago)

---

## Determination

**Classification: TRUE POSITIVE (TP)**

**Reasoning:**
1. Malicious intent suspected - deliberate repeated authentication attempts against a privileged account
2. Volume and timing indicate coordinated attack, not user error
3. Source workstation owned by IT staff, possible credential compromise or unauthorized access to that device
4. No successful authentication, but attack pattern is consistent with brute force methodology

---

## Response Actions

### Immediate Actions (Completed)

1. **Locked the "administrator" account** to prevent further compromise attempts
2. **Isolated workstation WORKSTATION-042** from the network for forensic analysis
3. **Initiated incident response protocol** - escalated to Security Operations Manager
4. **Reviewed failed authentication logs** for any successful lateral movement (none found)

### Containment

1. **Password Reset**: Administrator account password was reset using secure procedures
2. **Workstation Forensics**: Full disk image captured before any remediation
3. **Credential Audit**: Verified all privileged accounts for unauthorized changes

### Remediation

1. **Patched WORKSTATION-042** with latest security updates
2. **Deployed EDR monitoring** to detect future unauthorized access attempts
3. **Enabled MFA** on all administrative accounts
4. **Implemented account lockout policies**: 5 failed attempts = 30-minute lockout

---

## Lessons Learned

### Key Takeaways

1. **Effective Detection**: SIEM alerting enabled rapid identification within 3 minutes of initial suspicious activity
2. **Privileged Account Hardening**: Administrative accounts require additional protections (MFA, restricted login hours, IP whitelisting)
3. **Workstation Security**: IT-owned workstations are high-value targets and require enhanced monitoring
4. **Network Segmentation**: Privileged accounts should be accessed only from hardened administration workstations

### Recommendations

- Implement Multi-Factor Authentication (MFA) for all administrative accounts
- Deploy Privileged Access Management (PAM) solution for credential storage
- Establish IP-based restrictions for administrative logon locations
- Increase monitoring on Domain Controller authentication logs during business hours
- Conduct user awareness training on credential security

### Follow-Up Actions

- [ ] Schedule forensic analysis of WORKSTATION-042 hard drive
- [ ] Interview John Doe to determine if credentials were compromised
- [ ] Verify MFA implementation across all administrative accounts
- [ ] Update SIEM alert thresholds based on refined baseline
- [ ] Document this incident in the knowledge base for similar future alerts

---

**Incident Status**: Closed  
**Report Date**: 2025-08-15  
**Review Date**: 2025-08-16
