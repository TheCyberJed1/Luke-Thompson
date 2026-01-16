# OSINT Tool: IP Reputation Enrichment Script

**Tool Type**: OSINT Automation Script  
**Language**: Python 3.8+  
**Purpose**: Automated IP reputation gathering and threat intelligence enrichment  
**Status**: Active / In Use

---

## Tool Overview

This Python script automates the process of gathering threat intelligence on IP addresses using multiple free and commercial APIs. It enriches security investigations with reputation data, geographic location, ASN information, and known malware associations.

**Use Cases**:
- Investigate suspicious external IPs in network alerts
- Enrich source IPs from incident logs
- Bulk scanning of suspicious IP ranges
- Integration with SIEM for automated enrichment

---

## Ethical Use Disclaimer

**Important**: This tool is designed for authorized security investigations and legitimate security operations only. 

- Use only on IP addresses related to your organization's security incidents
- Comply with all applicable laws and regulations
- Respect API rate limits and terms of service
- Do not use for unauthorized scanning or intelligence gathering
- Coordinate with legal and compliance teams before investigation
- Report findings through proper incident response channels

---

## Features

### Data Sources Integrated

1. **AbuseIPDB**: IP reputation and reported abuse history
2. **VirusTotal**: File submissions and URL analysis
3. **AlienVault OTX**: Open threat intelligence feeds
4. **Shodan**: Internet-connected device and port scanning
5. **MaxMind GeoIP2**: Geographic location and ASN information
6. **Cisco Talos**: Threat intelligence and reputation

### Output Capabilities

- **Console Report**: Formatted text output for quick review
- **CSV Export**: Structured data for further analysis
- **JSON Output**: Machine-readable format for integration
- **SIEM Integration**: Direct API submission to SIEM platform

---

## Installation & Setup

### Requirements

```bash
Python 3.8+
pip install requests pandas geoip2
```

### Configuration

```python
# config.py
APIS = {
    'abuseipdb': {
        'url': 'https://api.abuseipdb.com/api/v2/check',
        'key': 'YOUR_API_KEY_HERE'
    },
    'virustotal': {
        'url': 'https://www.virustotal.com/api/v3/ip_addresses/',
        'key': 'YOUR_API_KEY_HERE'
    },
    'alienvault': {
        'url': 'https://otx.alienvault.com/api/v1/pulses/subscribed',
        'key': 'YOUR_API_KEY_HERE'
    }
}

GEOIP_DATABASE = '/path/to/GeoLite2-City.mmdb'
OUTPUT_FORMAT = 'json'  # json, csv, or text
```

---

## Usage Examples

### Single IP Investigation

```bash
$ python ip_enrichment.py --ip 185.220.101.45

╔════════════════════════════════════════════════════════════╗
║        IP REPUTATION ENRICHMENT REPORT                     ║
║                                                            ║
║ IP Address: 185.220.101.45                               ║
║ Queried: 2025-09-22 14:32:15 UTC                         ║
╚════════════════════════════════════════════════════════════╝

GEO-LOCATION
├─ Country: RU (Russia)
├─ City: Moscow
├─ Coordinates: 55.7558, 37.6173
├─ ASN: AS205216 (Bulletproof Hosting)
└─ ISP: Bulletproof Hosting Ltd.

REPUTATION SCORES
├─ AbuseIPDB: 95% (Malicious)
│  └─ Reports: 247 abuse reports in last 90 days
│  └─ Last Report: 2025-09-22 12:15:00 UTC
├─ AlienVault OTX: High Risk (Malware C2)
│  └─ Threat Type: Emotet Botnet C2
│  └─ Sources: 8 pulse subscriptions
└─ Shodan: Open Ports (8443, 5432, 3306)
   └─ SSH: OpenSSH 7.4 (outdated)
   └─ HTTP: HTTP/1.1 200 OK (possible web interface)

THREAT INTELLIGENCE
├─ Known Campaigns: Emotet (Banking Trojan)
├─ Attack Vectors: Email Phishing, Spear-phishing
├─ Target Sectors: Financial Services, Healthcare
├─ Associated Malware:
│  ├─ Emotet (SHA256: a1b2c3d4...)
│  └─ Trickbot (SHA256: e5f6g7h8...)
├─ Historical Activity:
│  └─ First Seen: 2024-06-15
│  └─ Last Seen: 2025-09-22
└─ Concurrent Beacons: 127 other IPs from same network

RECOMMENDATION: BLOCK - Confirmed malware C2 infrastructure
```

### Bulk IP Scanning

```bash
$ python ip_enrichment.py --file suspicious_ips.txt --output report.csv

Processing 50 IP addresses...
[████████████████░░░░░░░░░░░] 65%

Output: report.csv
Execution Time: 12 minutes 34 seconds
API Calls Made: 150 / 1000 (daily limit)
```

### SIEM Integration

```bash
$ python ip_enrichment.py --ip 185.220.101.45 --siem splunk --output json
{
  "ip": "185.220.101.45",
  "country": "RU",
  "asn": "AS205216",
  "reputation_score": 95,
  "threat_level": "critical",
  "malware_families": ["emotet", "trickbot"],
  "last_reported": "2025-09-22T12:15:00Z",
  "recommendation": "block"
}
```

---

## Integration with Incident Investigation

### Real-World Application

**Incident: NET-2025-1423 (Network Beaconing)**

```
1. Alert detects beaconing to 185.220.101.45
2. Analyst runs: python ip_enrichment.py --ip 185.220.101.45
3. Tool confirms:
   - 95% AbuseIPDB reputation score
   - Known Emotet C2 infrastructure
   - 247 abuse reports in last 90 days
4. High-confidence classification: TRUE POSITIVE
5. Immediate action: Block IP, isolate workstation
```

**Time Saved**: 15+ minutes of manual research condensed to < 1 minute

### Output Integration

- Results automatically appended to incident ticket
- SIEM dashboard updated with threat intelligence
- Email alert sent to incident response team
- Firewall rules automatically updated (with approval)

---

## API Rate Limits & Costs

| Service | Free Tier | Rate Limit | Cost for Higher Limits |
|---|---|---|---|
| AbuseIPDB | 1,000 queries/day | 1 query/sec | $99/month |
| VirusTotal | 4 requests/min | Standard | $0 (free tier sufficient) |
| AlienVault OTX | Unlimited | Unlimited | Free |
| Shodan | 1 query/month | Limited | $59/month |
| MaxMind GeoIP2 | 50,000/month | Depends | $0 - varies |

---

## Limitations & Considerations

### Limitations

- **API Delays**: Some services may have 24-48 hour data lag
- **Regional Blocking**: Some APIs may be blocked in certain jurisdictions
- **Accuracy Variance**: Different services may provide conflicting information
- **Rate Limits**: Free tier may not support high-volume scanning

### Best Practices

1. Cross-reference multiple sources for critical decisions
2. Document API response times for incident timelines
3. Cache results to avoid duplicate queries
4. Respect API terms of service and rate limits
5. Maintain audit logs of all enrichment queries

---

## Future Enhancements

- [ ] Integration with Slack for automated alerts
- [ ] Machine learning-based threat scoring
- [ ] Dark web forum monitoring integration
- [ ] Autonomous blocking via firewall API
- [ ] Historical tracking and trend analysis

---

## Responsible Disclosure

If this tool identifies a previously unknown malicious IP or infrastructure:

1. **Verify Findings**: Confirm through independent sources
2. **Document Evidence**: Maintain detailed logs of discovery
3. **Report Responsibly**: Follow coordinated disclosure practices
4. **Notify Authorities**: Contact CISA or FBI if targeting U.S. entities
5. **Protect Sources**: Do not disclose internal tools or methods publicly

---

**Last Updated**: September 2025  
**Version**: 2.1  
**Status**: Production - In Active Use  
**Maintenance**: Monthly API key validation and documentation updates
