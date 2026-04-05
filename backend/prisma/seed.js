const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stocks = [
  // ── IT / Technology ──
  { symbol: 'TCS',        name: 'Tata Consultancy Services', currentPrice: 3912.00, prevClose: 3875.00, sector: 'IT' },
  { symbol: 'INFY',       name: 'Infosys Ltd',               currentPrice: 1655.00, prevClose: 1642.00, sector: 'IT' },
  { symbol: 'WIPRO',      name: 'Wipro Ltd',                 currentPrice: 774.00,  prevClose: 768.00,  sector: 'IT' },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',          currentPrice: 1587.00, prevClose: 1572.00, sector: 'IT' },
  { symbol: 'TECHM',      name: 'Tech Mahindra',             currentPrice: 1298.00, prevClose: 1285.00, sector: 'IT' },
  { symbol: 'LTIM',       name: 'LTIMindtree',               currentPrice: 5420.00, prevClose: 5380.00, sector: 'IT' },
  { symbol: 'MPHASIS',    name: 'Mphasis Ltd',               currentPrice: 2890.00, prevClose: 2860.00, sector: 'IT' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems',        currentPrice: 5640.00, prevClose: 5590.00, sector: 'IT' },

  // ── Banking & Finance ──
  { symbol: 'HDFCBANK',   name: 'HDFC Bank Ltd',             currentPrice: 2067.00, prevClose: 2045.00, sector: 'Banking' },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank Ltd',            currentPrice: 1479.00, prevClose: 1462.00, sector: 'Banking' },
  { symbol: 'SBIN',       name: 'State Bank of India',       currentPrice: 720.00,  prevClose: 812.00,  sector: 'Banking' },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',       currentPrice: 2145.00, prevClose: 2120.00, sector: 'Banking' },
  { symbol: 'AXISBANK',   name: 'Axis Bank Ltd',             currentPrice: 1198.00, prevClose: 1182.00, sector: 'Banking' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank',             currentPrice: 1045.00, prevClose: 1032.00, sector: 'Banking' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda',            currentPrice: 248.00,  prevClose: 244.00,  sector: 'Banking' },
  { symbol: 'PNB',        name: 'Punjab National Bank',      currentPrice: 102.00,  prevClose: 100.00,  sector: 'Banking' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd',         currentPrice: 10779.00,prevClose: 7150.00, sector: 'Finance' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv',             currentPrice: 1892.00, prevClose: 1875.00, sector: 'Finance' },
  { symbol: 'HDFCLIFE',   name: 'HDFC Life Insurance',       currentPrice: 745.00,  prevClose: 738.00,  sector: 'Finance' },
  { symbol: 'SBILIFE',    name: 'SBI Life Insurance',        currentPrice: 1892.00, prevClose: 1875.00, sector: 'Finance' },

  // ── Energy & Oil ──
  { symbol: 'RELIANCE',   name: 'Reliance Industries',       currentPrice: 3135.00, prevClose: 2820.00, sector: 'Energy' },
  { symbol: 'ONGC',       name: 'Oil & Natural Gas Corp',    currentPrice: 268.00,  prevClose: 265.00,  sector: 'Energy' },
  { symbol: 'IOC',        name: 'Indian Oil Corporation',    currentPrice: 168.00,  prevClose: 165.00,  sector: 'Energy' },
  { symbol: 'BPCL',       name: 'Bharat Petroleum Corp',     currentPrice: 312.00,  prevClose: 308.00,  sector: 'Energy' },
  { symbol: 'NTPC',       name: 'NTPC Ltd',                  currentPrice: 362.00,  prevClose: 358.00,  sector: 'Energy' },
  { symbol: 'POWERGRID',  name: 'Power Grid Corporation',    currentPrice: 298.00,  prevClose: 295.00,  sector: 'Energy' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy',        currentPrice: 1845.00, prevClose: 1820.00, sector: 'Energy' },
  { symbol: 'TATAPOWER',  name: 'Tata Power Company',        currentPrice: 428.00,  prevClose: 422.00,  sector: 'Energy' },

  // ── Auto ──
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd',           currentPrice: 806.00,  prevClose: 970.00,  sector: 'Auto' },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki India',       currentPrice: 12450.00,prevClose: 12300.00,sector: 'Auto' },
  { symbol: 'M&M',        name: 'Mahindra & Mahindra',       currentPrice: 3245.00, prevClose: 3210.00, sector: 'Auto' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd',            currentPrice: 9870.00, prevClose: 9750.00, sector: 'Auto' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp',             currentPrice: 4892.00, prevClose: 4840.00, sector: 'Auto' },
  { symbol: 'EICHERMOT',  name: 'Eicher Motors',             currentPrice: 5120.00, prevClose: 5060.00, sector: 'Auto' },
  { symbol: 'TVSMOTOR',   name: 'TVS Motor Company',         currentPrice: 2890.00, prevClose: 2850.00, sector: 'Auto' },

  // ── FMCG ──
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',        currentPrice: 2345.00, prevClose: 2320.00, sector: 'FMCG' },
  { symbol: 'ITC',        name: 'ITC Ltd',                   currentPrice: 478.00,  prevClose: 472.00,  sector: 'FMCG' },
  { symbol: 'NESTLEIND',  name: 'Nestle India',              currentPrice: 24500.00,prevClose: 24200.00,sector: 'FMCG' },
  { symbol: 'BRITANNIA',  name: 'Britannia Industries',      currentPrice: 5890.00, prevClose: 5820.00, sector: 'FMCG' },
  { symbol: 'DABUR',      name: 'Dabur India',               currentPrice: 548.00,  prevClose: 542.00,  sector: 'FMCG' },
  { symbol: 'MARICO',     name: 'Marico Ltd',                currentPrice: 645.00,  prevClose: 638.00,  sector: 'FMCG' },

  // ── Pharma ──
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',        currentPrice: 1892.00, prevClose: 1870.00, sector: 'Pharma' },
  { symbol: 'DRREDDY',    name: 'Dr Reddys Laboratories',    currentPrice: 6780.00, prevClose: 6720.00, sector: 'Pharma' },
  { symbol: 'CIPLA',      name: 'Cipla Ltd',                 currentPrice: 1542.00, prevClose: 1525.00, sector: 'Pharma' },
  { symbol: 'DIVISLAB',   name: 'Divis Laboratories',        currentPrice: 5890.00, prevClose: 5820.00, sector: 'Pharma' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals',          currentPrice: 7245.00, prevClose: 7180.00, sector: 'Pharma' },

  // ── Metals & Mining ──
  { symbol: 'TATASTEEL',  name: 'Tata Steel Ltd',            currentPrice: 162.00,  prevClose: 160.00,  sector: 'Metals' },
  { symbol: 'JSWSTEEL',   name: 'JSW Steel Ltd',             currentPrice: 978.00,  prevClose: 968.00,  sector: 'Metals' },
  { symbol: 'HINDALCO',   name: 'Hindalco Industries',       currentPrice: 698.00,  prevClose: 690.00,  sector: 'Metals' },
  { symbol: 'VEDL',       name: 'Vedanta Ltd',               currentPrice: 478.00,  prevClose: 472.00,  sector: 'Metals' },
  { symbol: 'COALINDIA',  name: 'Coal India Ltd',            currentPrice: 478.00,  prevClose: 472.00,  sector: 'Metals' },

  // ── Conglomerate / Others ──
  { symbol: 'ADANIENT',   name: 'Adani Enterprises',         currentPrice: 2011.00, prevClose: 2400.00, sector: 'Conglomerate' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ',         currentPrice: 1298.00, prevClose: 1280.00, sector: 'Conglomerate' },
  { symbol: 'LT',         name: 'Larsen & Toubro',           currentPrice: 3892.00, prevClose: 3850.00, sector: 'Infrastructure' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement',          currentPrice: 11450.00,prevClose: 11300.00,sector: 'Cement' },
  { symbol: 'GRASIM',     name: 'Grasim Industries',         currentPrice: 2890.00, prevClose: 2850.00, sector: 'Cement' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',              currentPrice: 2678.00, prevClose: 2645.00, sector: 'Paints' },
  { symbol: 'TITAN',      name: 'Titan Company',             currentPrice: 3892.00, prevClose: 3850.00, sector: 'Consumer' },
  { symbol: 'DMART',      name: 'Avenue Supermarts (DMart)', currentPrice: 4892.00, prevClose: 4840.00, sector: 'Retail' },
  { symbol: 'ZOMATO',     name: 'Zomato Ltd',                currentPrice: 245.00,  prevClose: 242.00,  sector: 'Consumer Tech' },
  { symbol: 'NYKAA',      name: 'FSN E-Commerce (Nykaa)',    currentPrice: 178.00,  prevClose: 175.00,  sector: 'Consumer Tech' },
  { symbol: 'PAYTM',      name: 'One97 Communications',      currentPrice: 892.00,  prevClose: 882.00,  sector: 'Fintech' },
];

async function main() {
  console.log(`Seeding ${stocks.length} stocks...`);
  for (const stock of stocks) {
    const change = parseFloat((stock.currentPrice - stock.prevClose).toFixed(2));
    const changePercent = parseFloat(((change / stock.prevClose) * 100).toFixed(2));
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {
        name: stock.name,
        currentPrice: stock.currentPrice,
        prevClose: stock.prevClose,
        change,
        changePercent,
        sector: stock.sector,
      },
      create: {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        prevClose: stock.prevClose,
        change,
        changePercent,
        sector: stock.sector,
      },
    });
    console.log(`  ✓ ${stock.symbol} (${stock.sector})`);
  }
  console.log(`\nDone! ${stocks.length} stocks seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
