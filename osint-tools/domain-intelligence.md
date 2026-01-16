# OSINT Tool: Domain Intelligence Aggregator

**Tool Type**: OSINT Automation Script  
**Language**: Python 3.8+ with async support  
**Purpose**: Comprehensive domain reconnaissance and threat intelligence gathering  
**Status**: Active / In Use

---

## Tool Overview

This Python tool automates comprehensive domain reconnaissance across multiple free and commercial intelligence platforms. It provides domain ownership, DNS configuration, SSL certificate information, subdomains, and threat intelligence in a single unified report.

**Use Cases**:
- Investigate suspected phishing domains during incident response
- Monitor domain reputation and SSL certificate changes
- Identify infrastructure used by threat actors
- Validate domain legitimacy before employee interaction
- Support threat hunting and adversary infrastructure mapping

---

## Ethical Use Disclaimer

**Critical**: This tool must be used responsibly and legally.

- Only investigate domains relevant to your organization's security incidents
- Comply with all applicable laws and regulations (CFAA, GDPR, etc.)
- Do not use for domain enumeration without authorization
- Respect Terms of Service for all APIs and data providers
- Obtain proper authorization before detailed reconnaissance
- Report findings only to appropriate parties

---

## Features

### Intelligence Data Sources

1. **DNS Records**: A, AAAA, MX, TXT, CNAME, NS records
2. **WHOIS Data**: Domain registrar, registration date, expiration, privacy status
3. **SSL Certificates**: Certificate validity, issuer, subject alternate names
4. **Subdomains**: Enumeration via Certificate Transparency (CT) logs
5. **Web Technology**: CMS, hosting provider, server software identification
6. **Threat Intelligence**: Malware associations, phishing reports, reputation
7. **Historical Data**: PDNS records, registrar history, IP changes

### Report Generation

- Executive Summary with risk assessment
- Detailed technical findings
- Timeline of domain lifecycle
- Threat correlation and indicators
- Recommendations and remediation steps
- CSV/JSON export for further analysis

---

## Installation

### Requirements

```bash
Python 3.8+
pip install requests dnspython whois ssl-certificate-transparency builtwith \
    geoip2 pandas aiohttp
```

### Configuration

```python
# config.py
INTELLIGENCE_SOURCES = {
    'google_dns': 'https://8.8.8.8',
    'cloudflare_dns': 'https://1.1.1.1',
    'certificate_transparency': 'https://crt.sh',
    'abuse_ipdb': 'YOUR_API_KEY',
    'virustotal': 'YOUR_API_KEY',
    'urlhaus': 'https://urlhaus-api.abuse.ch/v1/',
    'phishtank': 'https://api.phishtank.com/
}

OUTPUT_DIR = './reports'
TIMEOUT = 30  # seconds
ASYNC = True
```

---

## Usage Examples

### Full Domain Investigation

```bash
$ python domain_intel.py --domain suspicious-paypal-verify.tk

╔════════════════════════════════════════════════════════════╗
║         DOMAIN INTELLIGENCE REPORT                         ║
║                                                            ║
║ Domain: suspicious-paypal-verify.tk                       ║
║ Report Generated: 2025-09-20 10:15:30 UTC                ║
╚════════════════════════════════════════════════════════════╝

DOMAIN REGISTRATION
├─ Registrar: GoDaddy.com, Inc.
├─ Registration Date: 2025-09-18
├─ Expiration Date: 2026-09-18
├─ Registrant: REDACTED (Privacy Protection Enabled)
├─ Registrant Email: Not Available (Privacy)
├─ Registrant Phone: Not Available (Privacy)
├─ Registrant Organization: Not Disclosed
└─ Registration Status: ACTIVE (newly registered)

DNS CONFIGURATION
├─ Nameservers:
│  ├─ ns1.hostgator.com (IP: 208.118.227.10)
│  ├─ ns2.hostgator.com (IP: 208.118.228.10)
│  └─ ns3.hostgator.com (IP: 208.118.229.10)
├─ A Record: 74.125.228.72 (HostGator hosting)
├─ MX Records:
│  ├─ mail.suspicious-paypal-verify.tk (priority: 10)
│  └─ mail2.suspicious-paypal-verify.tk (priority: 20)
├─ TXT Records:
│  ├─ v=spf1 include:hostgator.com ~all
│  └─ google-site-verification=abc123def456
└─ CNAME: None

SSL CERTIFICATE
├─ Certificate Status: VALID
├─ Subject: suspicious-paypal-verify.tk
├─ Issuer: Let's Encrypt (free certificate)
├─ Valid From: 2025-09-19 00:00:00 UTC
├─ Valid Until: 2025-12-18 23:59:59 UTC
├─ Certificate Hash: SHA256: a1b2c3d4e5f6g7h8...
├─ Subject Alternative Names:
│  ├─ suspicious-paypal-verify.tk
│  └─ www.suspicious-paypal-verify.tk
└─ Certificate Authority: Let's Encrypt Authority X3

SUBDOMAINS IDENTIFIED
├─ www.suspicious-paypal-verify.tk (A: 74.125.228.72)
├─ mail.suspicious-paypal-verify.tk (A: 74.125.228.73)
├─ admin.suspicious-paypal-verify.tk (A: 74.125.228.74)
└─ (3 additional subdomains discovered)

HOSTING PROVIDER
├─ ISP: HostGator
├─ Country: US
├─ Hosting Type: Shared hosting (multiple domains)
├─ Historical IPs:
│  ├─ 74.125.228.72 (2025-09-18 - present)
│  └─ 66.147.244.72 (2024-12-15 - 2025-09-17, old IP)
└─ Concurrent Domains on IP: 247 domains

WEB TECHNOLOGIES
├─ CMS: WordPress 6.1
├─ Web Server: Apache/2.4.58
├─ Server OS: Linux
├─ PHP Version: 7.4.33
├─ Advertising: Google Analytics (UA-123456789)
└─ JavaScript Libraries: jQuery 3.6, Bootstrap 5

THREAT INTELLIGENCE
├─ Phishing Reports: 8 reports (PhishTank, URLhaus)
├─ Malware Associated: None detected
├─ Domain Reputation Score: 92/100 (HIGHLY SUSPICIOUS)
├─ Threat Assessment: HIGH - Confirmed phishing domain
├─ Report Details:
│  ├─ Phishing Target: PayPal credential harvesting
│  ├─ Reported By: 8 sources (2025-09-19 - 2025-09-20)
│  └─ Confidence: 99%
├─ Recent Threats:
│  └─ URLhaus Report: ID 1234567 (phishing - PayPal)
├─ WHOIS Privacy Abuse:
│  └─ HostGator privacy service prevents contact
└─ Domain Age Risk: 2 days old (high risk for phishing)

HISTORICAL ANALYSIS
├─ First Resolved: 2025-09-18 14:32:00 UTC
├─ Last Resolved: 2025-09-20 10:00:00 UTC
├─ Registrar Changes: None
├─ Hosting Provider Changes: 1 (recent migration)
├─ IP Address Changes: 1 (old IP: 66.147.244.72)
└─ Active Period: 2 days

SIMILAR DOMAINS (TYPOSQUATTING ANALYSIS)
├─ suspicious-paypal-verify.tk (THIS DOMAIN)
├─ suspicious-paypal-verify.com (NOT OWNED by PayPal)
├─ suspicious-paypal-verify.net (Available for registration)
├─ paypal-verify-suspicious.tk (Unrelated)
└─ Note: Multiple variants exist (typosquatting ring suspected)

EMAIL CONFIGURATION
├─ Email Server: mail.suspicious-paypal-verify.tk
├─ MX Records Spoofed: Potentially (setup suspicious)
├─ SPF Configuration: Questionable (includes hostgator.com)
├─ DKIM Records: None found
├─ DMARC Policy: None configured
└─ Assessment: Email spoofing risk HIGH

RISK ASSESSMENT SUMMARY
╔═══════════════════════════════════════════════════════╗
║  OVERALL RISK LEVEL: CRITICAL                         ║
║  Confidence: 99%                                      ║
║  Recommendation: IMMEDIATE BLOCKING & TAKEDOWN        ║
╚═══════════════════════════════════════════════════════╝

INDICATORS OF COMPROMISE (IOCs)
├─ Domain: suspicious-paypal-verify.tk
├─ IP Addresses: 74.125.228.72, 74.125.228.73, 74.125.228.74
├─ SSL Fingerprint: SHA256:a1b2c3d4e5f6g7h8...
├─ Nameservers: ns1/2/3.hostgator.com
└─ Registrar: GoDaddy.com

RECOMMENDED ACTIONS
1. Block domain on firewall and proxy
2. Add to company blocklist
3. Send phishing alert to employees
4. Report to PayPal abuse team
5. Submit to law enforcement (IC3, FBI)
6. Monitor for similar variant domains
7. Educate users on domain verification

```

### Quick Threat Assessment

```bash
$ python domain_intel.py --domain suspicious-paypal-verify.tk --format brief

Domain: suspicious-paypal-verify.tk
Status: ACTIVE (2 days old)
IP: 74.125.228.72 (HostGator)
SSL: Valid (Let's Encrypt)
Threat: CRITICAL (Phishing - 8 reports)
Recommendation: BLOCK IMMEDIATELY
```

### Bulk Domain Scanning

```bash
$ python domain_intel.py --file domains.txt --output results.csv

Processing 25 domains...
[████████████████████████░░░] 90%

Summary:
├─ Scanned: 25
├─ Malicious: 3
├─ Suspicious: 5
├─ Clean: 17
└─ Execution Time: 4 minutes 23 seconds

Output: results.csv (structured data for import)
```

---

## Integration with Incident Response

### Case Study: Phishing Campaign Investigation

**Scenario**: Employee receives phishing email with domain link

```
1. Analyst clicks domain link in email
2. Immediately runs: python domain_intel.py --domain [domain]
3. Tool identifies:
   - Domain registered 2 days ago
   - 8 phishing reports in database
   - Typosquatting variant of legitimate company
   - Hosted on shared HostGator infrastructure
4. Classification: CONFIRMED PHISHING
5. Actions taken:
   - Block domain on firewall
   - Send alert to organization
   - Report to upstream ISP
   - Monitor for variants
```

**Time to Resolution**: < 5 minutes vs. 30+ minutes manual investigation

---

## Threat Intelligence Feeds

### Integrated Databases

- **PhishTank**: Verified phishing sites
- **URLhaus**: Malware distribution platforms
- **Abuse.ch**: Malware and botnet infrastructure
- **OpenPhish**: Phishing URL feeds
- **Malwarebytes**: Domain reputation data

### Custom Integration

Tool supports integration with:
- SIEM platforms (Splunk, ELK)
- Threat intelligence platforms (Maltego, ThreatStream)
- Firewall management systems
- Email security gateways

---

## Limitations & Best Practices

### Known Limitations

- DNS propagation delays (24-48 hours typical)
- Free certificate data may have 24-hour lag
- Some APIs may block geographic regions
- Rate limits on public APIs
- WHOIS privacy may hide registrant details

### Best Practices

1. **Verify Multiple Sources**: Cross-reference findings across databases
2. **Document Timeline**: Record investigation timestamps
3. **Preserve Evidence**: Screenshot reports before domain takedown
4. **Legal Review**: Consult legal before domain blocking
5. **Report Responsibly**: Follow disclosure guidelines

---

## Future Enhancements

- [ ] Automated domain monitoring and alerting
- [ ] Dark web domain scanning
- [ ] Advanced Machine Learning for phishing detection
- [ ] Integration with threat intelligence platforms
- [ ] Autonomous firewall rule generation

---

**Last Updated**: September 2025  
**Version**: 3.0  
**Status**: Production - In Active Use  
**Incident Usage**: Primary tool for domain investigation in incidents
