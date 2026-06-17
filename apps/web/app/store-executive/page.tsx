const colors = {
  panel: '#ffffff',
  accent: '#166534',
  text: '#0f172a',
  muted: '#475569',
};

const stats = [
  { title: 'Total Orders Today', value: '142', note: '+12% from yesterday' },
  { title: 'Pending Orders', value: '28', note: 'Waiting for fulfillment' },
  { title: 'Completed Orders', value: '114', note: 'Efficiency: 82%' },
  { title: 'Inventory Status', value: 'Good Standing', note: '4 items low stock' },
];

const recentOrders = [
  { id: 'INV-1001', customer: 'Green Leaf Co.', status: 'Processing', amount: '$1,240' },
  { id: 'INV-1002', customer: 'Sunrise Grocers', status: 'Delivered', amount: '$920' },
  { id: 'INV-1003', customer: 'Earth Market', status: 'Pending', amount: '$1,480' },
  { id: 'INV-1004', customer: 'Harvest Club', status: 'Shipped', amount: '$760' },
];

const styles: Record<string, Record<string, string | number>> = {
  page: {
    minHeight: '100vh',
    padding: '28px',
    backgroundColor: '#eef4ed',
    color: colors.text,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '18px',
    marginBottom: '28px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: colors.accent,
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 700,
  },
  searchBar: {
    minWidth: '280px',
    flex: 1,
    maxWidth: '420px',
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid #d1d5db',
    outline: 'none',
    background: '#ffffff',
  },
  button: {
    padding: '0 22px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: colors.accent,
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  status: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  statCard: {
    flex: '1 1 220px',
    minWidth: '220px',
    padding: '28px',
    borderRadius: '28px',
    background: colors.panel,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  statTitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: colors.muted,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  statValue: {
    margin: '18px 0 12px',
    fontSize: '2.6rem',
    fontWeight: 700,
  },
  statNote: {
    margin: 0,
    color: colors.muted,
  },
  bodySection: {
    display: 'grid',
    gridTemplateColumns: '1.45fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  recentCard: {
    padding: '28px',
    borderRadius: '30px',
    background: colors.panel,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  recentTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  viewAll: {
    color: colors.accent,
    cursor: 'pointer',
    fontWeight: 700,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px 0 12px',
    color: colors.muted,
    fontSize: '0.95rem',
  },
  td: {
    padding: '14px 0',
    borderTop: '1px solid #e2e8f0',
    fontSize: '0.98rem',
  },
  quickActions: {
    padding: '28px',
    borderRadius: '30px',
    background: colors.panel,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  quickTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '18px',
  },
  quickButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '18px',
    borderRadius: '20px',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

function renderStatus(status: string) {
  const label: Record<string, { color: string; text: string }> = {
    Processing: { color: '#f59e0b', text: 'Processing' },
    Delivered: { color: '#16a34a', text: 'Delivered' },
    Pending: { color: '#0f766e', text: 'Pending' },
    Shipped: { color: '#2563eb', text: 'Shipped' },
  };

  const item = label[status] || { color: '#64748b', text: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: `${item.color}1a`, color: item.color, fontWeight: 700, fontSize: '0.88rem' }}>
      {item.text}
    </span>
  );
}

export default function StoreExecutivePage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.brand}>
          <span>🟢</span>
          <div>Vipasa Organics</div>
        </div>
        <div style={styles.titleGroup}>
          <h1 style={styles.pageTitle}>Executive Portal</h1>
          <div style={{ color: colors.muted }}>Search orders, stock and executive insights.</div>
        </div>
        <div style={styles.searchBar}>
          <input style={styles.input} placeholder="Search orders, stock..." />
          <button type="button" style={styles.button}>Search</button>
        </div>
      </div>

      <div style={styles.status}>
        {stats.map((stat) => (
          <div key={stat.title} style={styles.statCard}>
            <p style={styles.statTitle}>{stat.title}</p>
            <h2 style={styles.statValue}>{stat.value}</h2>
            <p style={styles.statNote}>{stat.note}</p>
          </div>
        ))}
      </div>

      <div style={styles.bodySection}>
        <section style={styles.recentCard}>
          <div style={styles.recentHeader}>
            <h2 style={styles.recentTitle}>Recent Orders</h2>
            <span style={styles.viewAll}>View All</span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}>{order.id}</td>
                  <td style={styles.td}>{order.customer}</td>
                  <td style={styles.td}>{renderStatus(order.status)}</td>
                  <td style={styles.td}>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside style={styles.quickActions}>
          <h2 style={styles.quickTitle}>Quick Actions</h2>
          <button type="button" style={styles.quickButton}>Create Order</button>
        </aside>
      </div>
    </div>
  );
}
