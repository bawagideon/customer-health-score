// Customer Health Score Engine
class CustomerHealthScoreEngine {
  constructor() {
    this.weights = {
      usage: 0.35,
      support: 0.25,
      payment: 0.20,
      engagement: 0.20
    };
  }

  scoreAccount(metrics) {
    const usageScore = Math.min(100, Math.max(0, metrics.usageRate || 0));
    const supportScore = Math.min(100, Math.max(0, 100 - (metrics.unresolvedTickets || 0) * 15 - (metrics.negativeSentiments || 0) * 20));
    const paymentScore = metrics.hasOverdueInvoices ? 20 : 100;
    const engagementScore = Math.min(100, Math.max(0, 100 - (metrics.daysSinceExecutiveContact || 0) * 2));

    const totalScore = Math.round(
      usageScore * this.weights.usage +
      supportScore * this.weights.support +
      paymentScore * this.weights.payment +
      engagementScore * this.weights.engagement
    );

    let grade = 'A';
    let status = 'THRIVING';
    if (totalScore < 50) {
      grade = 'D';
      status = 'ENDANGERED';
    } else if (totalScore < 70) {
      grade = 'C';
      status = 'NEEDS_ATTENTION';
    } else if (totalScore < 85) {
      grade = 'B';
      status = 'STABLE';
    }

    return {
      accountId: metrics.accountId,
      accountName: metrics.accountName,
      totalScore,
      grade,
      status,
      factors: {
        usage: { score: usageScore, weight: this.weights.usage, contribution: Math.round(usageScore * this.weights.usage) },
        support: { score: supportScore, weight: this.weights.support, contribution: Math.round(supportScore * this.weights.support) },
        payment: { score: paymentScore, weight: this.weights.payment, contribution: Math.round(paymentScore * this.weights.payment) },
        engagement: { score: engagementScore, weight: this.weights.engagement, contribution: Math.round(engagementScore * this.weights.engagement) }
      },
      topRiskFactor: this.identifyTopRisk(usageScore, supportScore, paymentScore, engagementScore)
    };
  }

  identifyTopRisk(u, s, p, e) {
    const list = [
      { name: 'Low Product Adoption', val: u },
      { name: 'Support Friction / Bugs', val: s },
      { name: 'Payment & Invoice Delinquency', val: p },
      { name: 'Executive Sponsor Disengagement', val: e }
    ];
    list.sort((a, b) => a.val - b.val);
    return list[0].val < 70 ? list[0].name : 'None (Healthy)';
  }
}

module.exports = { CustomerHealthScoreEngine };
