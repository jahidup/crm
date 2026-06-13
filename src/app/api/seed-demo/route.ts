import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Followup } from '@/lib/models/Followup';
import { Opportunity } from '@/lib/models/Opportunity';
import { Activity } from '@/lib/models/Activity';
import { Settings } from '@/lib/models/Settings';
import { User } from '@/lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    // Get an admin user to associate
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return NextResponse.json({ error: 'Please visit /api/setup-admin first to seed the admin user.' }, { status: 400 });
    }

    // Clear existing data
    await Lead.deleteMany({});
    await Followup.deleteMany({});
    await Opportunity.deleteMany({});
    await Activity.deleteMany({});
    await Settings.deleteMany({});

    // Seed Settings
    await Settings.create({
      companyName: 'NexGenAiTech',
      companyEmail: 'contact@nexgenaitech.com',
      companyPhone: '+1 (555) 019-2834',
      companyAddress: 'Silicon Valley, California',
    });

    // Seed Leads
    const leadsData = [
      {
        name: 'Sarah Connor',
        company: 'Cyberdyne Systems',
        industry: 'Robotics & AI',
        category: 'Enterprise',
        website: 'https://cyberdyne.io',
        contactPerson: 'Sarah Connor (CTO)',
        email: 'sconnor@cyberdyne.io',
        phone: '+1 (555) 890-4321',
        whatsApp: '+1 (555) 890-4321',
        socials: {
          linkedIn: 'https://linkedin.com/in/sarah-connor-cyberdyne',
          instagram: 'https://instagram.com/sconnor_robotics',
          facebook: '',
          twitter: 'https://x.com/sconnor_robotics',
          youtube: '',
        },
        business: {
          country: 'United States',
          city: 'Los Angeles',
          description: 'A hardware and software manufacturer specializing in artificial intelligence and automation solutions.',
        },
        status: 'Interested',
        priority: 'High',
        notes: 'Interested in our AI-driven sales optimization platform to streamline robotics client prospecting.',
        tags: ['Robotics', 'High-value', 'Enterprise'],
        assignedTo: admin._id,
      },
      {
        name: 'Tony Stark',
        company: 'Stark Industries',
        industry: 'Energy & Defense',
        category: 'Enterprise',
        website: 'https://starkindustries.com',
        contactPerson: 'Tony Stark (CEO)',
        email: 'tony@starkindustries.com',
        phone: '+1 (555) 300-3000',
        whatsApp: '+1 (555) 300-3000',
        socials: {
          linkedIn: 'https://linkedin.com/company/stark-industries',
          instagram: '',
          facebook: '',
          twitter: 'https://x.com/iron_stark',
          youtube: 'https://youtube.com/stark_industries',
        },
        business: {
          country: 'United States',
          city: 'New York',
          description: 'Multinational conglomerate specializing in clean energy, defense technologies, and aerospace engineering.',
        },
        status: 'Won',
        priority: 'High',
        notes: 'Signed deal for custom LLM deployment in their logistics core. Revenue generated in full.',
        tags: ['SaaS', 'Won', 'LLM'],
        assignedTo: admin._id,
      },
      {
        name: 'Bruce Wayne',
        company: 'Wayne Enterprises',
        industry: 'Technology & Real Estate',
        category: 'Enterprise',
        website: 'https://waynecorp.com',
        contactPerson: 'Bruce Wayne (Chairman)',
        email: 'bwayne@waynecorp.com',
        phone: '+1 (555) 912-4560',
        whatsApp: '+1 (555) 912-4560',
        socials: {
          linkedIn: 'https://linkedin.com/in/bruce-wayne-corp',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
        },
        business: {
          country: 'United States',
          city: 'Gotham City',
          description: 'A massive global conglomerate engaged in shipping, defense tech, clean energy, and venture capital.',
        },
        status: 'Proposal Sent',
        priority: 'High',
        notes: 'Sent proposal for upgrading Wayne Security Systems analytics suite using our Sales OS AI. Awaiting feedback.',
        tags: ['Proposal', 'Security', 'VIP'],
        assignedTo: admin._id,
      },
      {
        name: 'Elena Rostova',
        company: 'Volkova Fintech',
        industry: 'Finance',
        category: 'Mid-Market',
        website: 'https://volkovafintech.ru',
        contactPerson: 'Elena Rostova (VP Sales)',
        email: 'e.rostova@volkova.ru',
        phone: '+7 (495) 123-4567',
        whatsApp: '+7 (495) 123-4567',
        socials: {
          linkedIn: 'https://linkedin.com/in/elena-rostova-fintech',
          instagram: 'https://instagram.com/elena_fintech',
          facebook: '',
          twitter: '',
          youtube: '',
        },
        business: {
          country: 'Russia',
          city: 'Moscow',
          description: 'A growing microfinance and banking services app provider operating across Eastern Europe.',
        },
        status: 'New Lead',
        priority: 'Medium',
        notes: 'Lead captured from Web Forms. Looking to replace Hubspot CRM with a native AI workflow.',
        tags: ['Fintech', 'CRM-Migration'],
        assignedTo: admin._id,
      },
      {
        name: 'David Chen',
        company: 'SinoTech Imports',
        industry: 'Supply Chain',
        category: 'SMB',
        website: 'https://sinotechimports.cn',
        contactPerson: 'David Chen (Director)',
        email: 'dchen@sinotech.cn',
        phone: '+86 (21) 8888-8888',
        whatsApp: '',
        socials: {
          linkedIn: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
        },
        business: {
          country: 'China',
          city: 'Shanghai',
          description: 'Global logistics and distribution services provider managing imports and exports across APAC.',
        },
        status: 'Negotiation',
        priority: 'Medium',
        notes: 'Negotiating contract terms. Seeking a 20% discount on seat licensing for 50 agents.',
        tags: ['Logistics', 'Negotiation'],
        assignedTo: admin._id,
      },
      {
        name: 'Alice Johnson',
        company: 'EcoGreen Solutions',
        industry: 'Sustainability',
        category: 'SMB',
        website: 'https://ecogreensolutions.org',
        contactPerson: 'Alice Johnson (Marketing Lead)',
        email: 'ajohnson@ecogreen.org',
        phone: '+44 20 7946 0958',
        whatsApp: '+44 20 7946 0958',
        socials: {
          linkedIn: 'https://linkedin.com/in/alice-johnson-eco',
          instagram: '',
          facebook: '',
          twitter: 'https://x.com/alice_green',
          youtube: '',
        },
        business: {
          country: 'United Kingdom',
          city: 'London',
          description: 'Consulting agency helping businesses implement sustainable and eco-friendly carbon-neutral projects.',
        },
        status: 'Discovery Call',
        priority: 'Low',
        notes: 'Completed discovery call. Showed interest but budgets are tight for this fiscal quarter.',
        tags: ['Eco', 'Discovery'],
        assignedTo: admin._id,
      },
      {
        name: 'Carlos Mendez',
        company: 'Sol Y Mar Exports',
        industry: 'Agriculture',
        category: 'SMB',
        website: 'https://solymarexports.com',
        contactPerson: 'Carlos Mendez (Owner)',
        email: 'carlos@solymar.com',
        phone: '+34 91 555 1234',
        whatsApp: '+34 91 555 1234',
        socials: {
          linkedIn: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
        },
        business: {
          country: 'Spain',
          city: 'Madrid',
          description: 'Exporter of premium olive oil and fresh agricultural goods across European markets.',
        },
        status: 'Lost',
        priority: 'Low',
        notes: 'No response after several followups. Lost to a local vendor with lower pricing.',
        tags: ['Lost', 'Agriculture'],
        assignedTo: admin._id,
      }
    ];

    const seededLeads = await Lead.insertMany(leadsData);

    // Seed Opportunities
    const opportunitiesData = [
      {
        leadId: seededLeads[0]._id, // Cyberdyne Systems
        serviceOffered: 'AI Business Optimization Platform',
        estimatedBudget: 350000,
        probability: 70,
        expectedClosingDate: '2026-07-15',
        pipelineStage: 'Qualified',
      },
      {
        leadId: seededLeads[1]._id, // Stark Industries
        serviceOffered: 'Logistics AI Model Core Implementation',
        estimatedBudget: 950000,
        finalBudget: 950000,
        probability: 100,
        expectedClosingDate: '2026-06-01',
        pipelineStage: 'Won',
      },
      {
        leadId: seededLeads[2]._id, // Wayne Enterprises
        serviceOffered: 'Wayne Security Systems upgrade',
        estimatedBudget: 450000,
        probability: 60,
        expectedClosingDate: '2026-08-10',
        pipelineStage: 'Proposal',
      },
      {
        leadId: seededLeads[4]._id, // SinoTech Imports
        serviceOffered: 'CRM SaaS Deployment (50 users)',
        estimatedBudget: 120000,
        probability: 85,
        expectedClosingDate: '2026-06-25',
        pipelineStage: 'Negotiation',
      }
    ];

    await Opportunity.insertMany(opportunitiesData);

    // Seed Followups
    const followupsData = [
      {
        leadId: seededLeads[0]._id, // Cyberdyne Systems
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        time: '14:00',
        type: 'Meeting',
        notes: 'Present the customized AI analysis deck to Sarah Connor.',
        status: 'Upcoming',
      },
      {
        leadId: seededLeads[2]._id, // Wayne Enterprises
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
        time: '10:30',
        type: 'Call',
        notes: 'Call Bruce Wayne or his proxy to review the proposal sent on Tuesday.',
        status: 'Upcoming',
      },
      {
        leadId: seededLeads[3]._id, // Volkova Fintech
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        time: '11:00',
        type: 'Email',
        notes: 'Send initial outreach email with brochure.',
        status: 'Overdue',
      },
      {
        leadId: seededLeads[5]._id, // EcoGreen Solutions
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        time: '16:00',
        type: 'Call',
        notes: 'Discovery call was completed. Follow up on budget constraints.',
        status: 'Completed',
      }
    ];

    await Followup.insertMany(followupsData);

    // Seed Activities
    const activitiesData = [
      {
        leadId: seededLeads[1]._id,
        type: 'opportunity_won',
        description: 'Opportunity with Stark Industries won! Final contract value: ₹950,000.',
        userId: admin._id,
      },
      {
        leadId: seededLeads[2]._id,
        type: 'status_changed',
        description: 'Lead status changed to "Proposal Sent" for Wayne Enterprises.',
        userId: admin._id,
      },
      {
        leadId: seededLeads[0]._id,
        type: 'followup_added',
        description: 'New meeting follow-up scheduled with Cyberdyne Systems.',
        userId: admin._id,
      },
      {
        leadId: seededLeads[3]._id,
        type: 'lead_created',
        description: 'Lead created for Elena Rostova of Volkova Fintech from website.',
        userId: admin._id,
      }
    ];

    await Activity.insertMany(activitiesData);

    return NextResponse.json({
      success: true,
      message: 'Demo database seeded successfully.',
      leadsCount: seededLeads.length,
      opportunitiesCount: opportunitiesData.length,
      followupsCount: followupsData.length,
    });
  } catch (error: any) {
    console.error('Demo seeding error:', error);
    return NextResponse.json({ error: 'Server error during demo seeding' }, { status: 500 });
  }
}
