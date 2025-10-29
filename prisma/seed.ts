import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pitchbase.com' },
    update: {},
    create: {
      email: 'admin@pitchbase.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'growth' },
      update: {},
      create: {
        name: 'Growth',
        slug: 'growth',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'value' },
      update: {},
      create: {
        name: 'Value',
        slug: 'value',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'dividend' },
      update: {},
      create: {
        name: 'Dividend',
        slug: 'dividend',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'small-cap' },
      update: {},
      create: {
        name: 'Small Cap',
        slug: 'small-cap',
      },
    }),
  ])

  console.log('✅ Created tags:', tags.map(t => t.name).join(', '))

  // Create sample pitch
  const samplePitch = await prisma.pitch.upsert({
    where: { slug: 'tesla-the-future-of-transportation' },
    update: {},
    create: {
      title: 'Tesla: The Future of Transportation',
      slug: 'tesla-the-future-of-transportation',
      ticker: 'TSLA',
      sector: 'Automotive',
      rating: 4,
      timeframe: '2 years',
      summary:
        'Tesla represents a compelling investment opportunity as the leader in electric vehicle technology and sustainable energy solutions. With strong brand recognition, innovative technology, and expanding market share, Tesla is well-positioned for long-term growth.',
      content: `
# Investment Thesis

Tesla (TSLA) is positioned at the forefront of the electric vehicle revolution and sustainable energy transition. Our analysis suggests strong upside potential based on several key factors:

## Key Investment Drivers

### 1. Market Leadership
- Dominant position in the EV market with strong brand recognition
- First-mover advantage in autonomous driving technology
- Expanding global manufacturing footprint

### 2. Technology Innovation
- Industry-leading battery technology and energy efficiency
- Over-the-air software updates providing continuous value
- Integrated ecosystem of vehicles, energy storage, and solar

### 3. Financial Performance
- Strong revenue growth trajectory
- Improving margins as production scales
- Diversified revenue streams beyond automotive

## Risks to Consider

- High valuation multiples relative to traditional automakers
- Intense competition from established and new players
- Regulatory and policy uncertainties
- Execution risks in scaling production

## Conclusion

Despite near-term volatility, Tesla's long-term prospects remain compelling for investors with a 2+ year time horizon. The company's technology leadership and market position provide a strong foundation for continued growth.
      `,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
      tags: {
        create: [
          { tag: { connect: { id: tags[0].id } } }, // Technology
          { tag: { connect: { id: tags[1].id } } }, // Growth
        ],
      },
    },
  })

  console.log('✅ Created sample pitch:', samplePitch.title)

  // Create additional sample pitches
  const additionalPitches = await Promise.all([
    prisma.pitch.upsert({
      where: { slug: 'apple-premium-brand-powerhouse' },
      update: {},
      create: {
        title: 'Apple: Premium Brand Powerhouse',
        slug: 'apple-premium-brand-powerhouse',
        ticker: 'AAPL',
        sector: 'Technology',
        rating: 5,
        timeframe: '1 year',
        summary:
          'Apple continues to demonstrate exceptional brand strength and ecosystem lock-in, driving consistent revenue growth and expanding margins through services and premium hardware.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Technology
            { tag: { connect: { id: tags[1].id } } }, // Growth
          ],
        },
      },
    }),
    prisma.pitch.upsert({
      where: { slug: 'microsoft-cloud-transformation' },
      update: {},
      create: {
        title: 'Microsoft: Cloud Transformation Story',
        slug: 'microsoft-cloud-transformation',
        ticker: 'MSFT',
        sector: 'Technology',
        rating: 4,
        timeframe: '18 months',
        summary:
          "Microsoft's successful pivot to cloud computing positions it as a key beneficiary of enterprise digital transformation, with Azure and Office 365 driving sustainable growth.",
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Technology
            { tag: { connect: { id: tags[2].id } } }, // Value
          ],
        },
      },
    }),
  ])

  console.log(
    '✅ Created additional pitches:',
    additionalPitches.map(p => p.title).join(', ')
  )

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


