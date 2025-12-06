import {
  type Admin,
  type InsertAdmin,
  type Service,
  type InsertService,
  type PortfolioProject,
  type InsertPortfolioProject,
  type Inquiry,
  type InsertInquiry,
  type Testimonial,
  type InsertTestimonial,
  type ClientProject,
  type InsertClientProject,
  type Client,
  type InsertClient,
  type Contract,
  type InsertContract,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  getPortfolioProjects(): Promise<PortfolioProject[]>;
  getPortfolioProject(id: string): Promise<PortfolioProject | undefined>;
  createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updatePortfolioProject(id: string, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined>;
  deletePortfolioProject(id: string): Promise<boolean>;

  getInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, inquiry: Partial<Inquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: string): Promise<boolean>;

  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;

  getClientProjects(): Promise<ClientProject[]>;
  getClientProjectsByEmail(email: string): Promise<ClientProject[]>;
  getClientProject(id: string): Promise<ClientProject | undefined>;
  createClientProject(project: InsertClientProject): Promise<ClientProject>;
  updateClientProject(id: string, project: Partial<ClientProject>): Promise<ClientProject | undefined>;
  deleteClientProject(id: string): Promise<boolean>;

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getContracts(): Promise<Contract[]>;
  getContractsByClientId(clientId: string): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<Contract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private admins: Map<string, Admin>;
  private services: Map<string, Service>;
  private portfolioProjects: Map<string, PortfolioProject>;
  private inquiries: Map<string, Inquiry>;
  private testimonials: Map<string, Testimonial>;
  private clientProjects: Map<string, ClientProject>;
  private clients: Map<string, Client>;
  private contracts: Map<string, Contract>;

  constructor() {
    this.admins = new Map();
    this.services = new Map();
    this.portfolioProjects = new Map();
    this.inquiries = new Map();
    this.testimonials = new Map();
    this.clientProjects = new Map();
    this.clients = new Map();
    this.contracts = new Map();
    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    this.admins.set(adminId, {
      id: adminId,
      email: "sameerliaqat81@gmail.com",
      password: "Q4WVicB636c]",
      createdAt: new Date(),
    });

    const servicesData: InsertService[] = [
      {
        name: "SEO Services",
        description: "Boost your online visibility with expert search engine optimization strategies that drive organic traffic and improve rankings.",
        offerings: ["Keyword Research", "On-Page SEO", "Technical SEO", "Link Building", "Local SEO", "SEO Audits"],
        deliverables: ["Monthly SEO Reports", "Keyword Rankings", "Traffic Analysis", "Competitor Analysis"],
        timeline: "3-6 months",
        startingPrice: "$500",
        icon: "search",
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Web Development",
        description: "Custom website development solutions that combine stunning design with powerful functionality to elevate your online presence.",
        offerings: ["Custom Websites", "E-commerce Solutions", "Landing Pages", "Web Applications", "CMS Development", "Website Maintenance"],
        deliverables: ["Responsive Website", "Source Code", "Documentation", "Training Session"],
        timeline: "4-8 weeks",
        startingPrice: "$1,500",
        icon: "globe",
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Android App Development",
        description: "Native and cross-platform mobile applications designed to deliver exceptional user experiences on Android devices.",
        offerings: ["Native Android Apps", "Cross-Platform Apps", "App Redesign", "App Maintenance", "API Integration", "App Store Optimization"],
        deliverables: ["APK File", "Source Code", "Play Store Listing", "User Documentation"],
        timeline: "8-12 weeks",
        startingPrice: "$3,000",
        icon: "smartphone",
        isActive: true,
        sortOrder: 3,
      },
      {
        name: "Graphic Design",
        description: "Creative visual solutions that communicate your brand message effectively and leave lasting impressions.",
        offerings: ["Logo Design", "Brand Identity", "Marketing Materials", "Social Media Graphics", "Infographics", "Print Design"],
        deliverables: ["Design Files (AI, PSD, PNG)", "Brand Guidelines", "Multiple Variations", "Print-Ready Files"],
        timeline: "1-2 weeks",
        startingPrice: "$200",
        icon: "image",
        isActive: true,
        sortOrder: 4,
      },
      {
        name: "Social Media Marketing",
        description: "Strategic social media management that builds your brand, engages your audience, and drives measurable results.",
        offerings: ["Content Strategy", "Content Creation", "Community Management", "Paid Advertising", "Influencer Marketing", "Analytics & Reporting"],
        deliverables: ["Content Calendar", "Monthly Reports", "Engagement Analysis", "Growth Metrics"],
        timeline: "Ongoing",
        startingPrice: "$400/month",
        icon: "share-2",
        isActive: true,
        sortOrder: 5,
      },
      {
        name: "Branding & UI/UX Design",
        description: "Comprehensive branding and user experience design that creates memorable digital products and cohesive brand identities.",
        offerings: ["Brand Strategy", "Visual Identity", "UI Design", "UX Research", "Wireframing", "Prototyping"],
        deliverables: ["Brand Book", "UI Kit", "Figma Files", "User Flow Diagrams"],
        timeline: "2-4 weeks",
        startingPrice: "$800",
        icon: "layers",
        isActive: true,
        sortOrder: 6,
      },
      {
        name: "AI Automation Workflows",
        description: "Intelligent automation solutions that streamline your business processes and boost productivity using cutting-edge AI technology.",
        offerings: ["Process Automation", "Workflow Optimization", "AI Integration", "Chatbot Development", "Data Processing", "Custom AI Solutions"],
        deliverables: ["Automation Setup", "Documentation", "Training", "Maintenance Support"],
        timeline: "2-6 weeks",
        startingPrice: "$1,000",
        icon: "cpu",
        isActive: true,
        sortOrder: 7,
      },
      {
        name: "AI Chatbots & AI Agents",
        description: "Advanced conversational AI solutions that enhance customer service, automate support, and provide 24/7 intelligent assistance.",
        offerings: ["Custom Chatbots", "AI Agents", "Voice Assistants", "NLP Solutions", "Integration Services", "Training & Fine-tuning"],
        deliverables: ["Deployed Chatbot", "API Access", "Analytics Dashboard", "Training Data"],
        timeline: "3-8 weeks",
        startingPrice: "$1,500",
        icon: "message-circle",
        isActive: true,
        sortOrder: 8,
      },
    ];

    servicesData.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        ...service,
        id,
        isActive: service.isActive ?? true,
        sortOrder: service.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const portfolioData: InsertPortfolioProject[] = [
      {
        title: "E-Commerce Platform Redesign",
        description: "Complete redesign and development of a modern e-commerce platform with improved UX and 40% increase in conversions.",
        category: "Web Development",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["Responsive Website", "Payment Integration", "Admin Dashboard"],
        isActive: true,
      },
      {
        title: "Restaurant Mobile App",
        description: "Native Android app for a restaurant chain featuring online ordering, reservations, and loyalty programs.",
        category: "App Development",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["Android App", "Backend API", "Admin Panel"],
        isActive: true,
      },
      {
        title: "Tech Startup Brand Identity",
        description: "Complete brand identity design including logo, color palette, typography, and brand guidelines for a fintech startup.",
        category: "Graphic Design",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["Logo", "Brand Guidelines", "Marketing Materials"],
        isActive: true,
      },
      {
        title: "SEO Campaign - Real Estate",
        description: "Comprehensive SEO strategy that increased organic traffic by 150% and improved keyword rankings across 50+ target keywords.",
        category: "SEO",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["SEO Audit", "Content Strategy", "Link Building"],
        isActive: true,
      },
      {
        title: "Social Media Growth Campaign",
        description: "6-month social media marketing campaign that grew followers by 300% and engagement rate by 5x for a lifestyle brand.",
        category: "Social Media",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["Content Strategy", "Monthly Reports", "Paid Ads Management"],
        isActive: true,
      },
      {
        title: "Customer Service AI Chatbot",
        description: "AI-powered chatbot that handles 70% of customer inquiries automatically, reducing support costs by 45%.",
        category: "AI Automation",
        imageUrl: null,
        projectUrl: null,
        deliverables: ["Chatbot", "Integration", "Training"],
        isActive: true,
      },
    ];

    portfolioData.forEach((project) => {
      const id = randomUUID();
      this.portfolioProjects.set(id, {
        ...project,
        id,
        imageUrl: project.imageUrl ?? null,
        projectUrl: project.projectUrl ?? null,
        deliverables: project.deliverables ?? null,
        isActive: project.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const testimonialsData: InsertTestimonial[] = [
      {
        clientName: "Sarah Johnson",
        company: "TechStart Inc.",
        quote: "Muhammad Sammer transformed our online presence completely. Our website traffic increased by 200% within 3 months!",
        avatarUrl: null,
        isActive: true,
      },
      {
        clientName: "Ahmed Khan",
        company: "GreenLeaf Organics",
        quote: "The mobile app developed exceeded our expectations. User engagement is through the roof and our customers love it.",
        avatarUrl: null,
        isActive: true,
      },
      {
        clientName: "Emma Williams",
        company: "Fashion Forward",
        quote: "Professional, creative, and always delivers on time. The branding work done for our company was absolutely stunning.",
        avatarUrl: null,
        isActive: true,
      },
      {
        clientName: "Michael Chen",
        company: "CloudSync Solutions",
        quote: "The AI automation workflow saved us countless hours of manual work. ROI was achieved within the first month!",
        avatarUrl: null,
        isActive: true,
      },
    ];

    testimonialsData.forEach((testimonial) => {
      const id = randomUUID();
      this.testimonials.set(id, {
        ...testimonial,
        id,
        company: testimonial.company ?? null,
        avatarUrl: testimonial.avatarUrl ?? null,
        isActive: testimonial.isActive ?? true,
        createdAt: new Date(),
      });
    });
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find((admin) => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id, createdAt: new Date() };
    this.admins.set(id, admin);
    return admin;
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = {
      ...insertService,
      id,
      isActive: insertService.isActive ?? true,
      sortOrder: insertService.sortOrder ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    const updated = { ...service, ...updates, updatedAt: new Date() };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  async getPortfolioProjects(): Promise<PortfolioProject[]> {
    return Array.from(this.portfolioProjects.values()).filter((p) => p.isActive);
  }

  async getPortfolioProject(id: string): Promise<PortfolioProject | undefined> {
    return this.portfolioProjects.get(id);
  }

  async createPortfolioProject(insertProject: InsertPortfolioProject): Promise<PortfolioProject> {
    const id = randomUUID();
    const project: PortfolioProject = {
      ...insertProject,
      id,
      imageUrl: insertProject.imageUrl ?? null,
      projectUrl: insertProject.projectUrl ?? null,
      deliverables: insertProject.deliverables ?? null,
      isActive: insertProject.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.portfolioProjects.set(id, project);
    return project;
  }

  async updatePortfolioProject(id: string, updates: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined> {
    const project = this.portfolioProjects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.portfolioProjects.set(id, updated);
    return updated;
  }

  async deletePortfolioProject(id: string): Promise<boolean> {
    return this.portfolioProjects.delete(id);
  }

  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      phone: insertInquiry.phone ?? null,
      attachmentUrl: insertInquiry.attachmentUrl ?? null,
      status: "pending",
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    const updated = { ...inquiry, ...updates, updatedAt: new Date() };
    this.inquiries.set(id, updated);
    return updated;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    return this.inquiries.delete(id);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter((t) => t.isActive);
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      company: insertTestimonial.company ?? null,
      avatarUrl: insertTestimonial.avatarUrl ?? null,
      isActive: insertTestimonial.isActive ?? true,
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    const updated = { ...testimonial, ...updates };
    this.testimonials.set(id, updated);
    return updated;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    return this.testimonials.delete(id);
  }

  async getClientProjects(): Promise<ClientProject[]> {
    return Array.from(this.clientProjects.values())
      .filter((p) => p.isVisibleToClient)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClientProjectsByEmail(email: string): Promise<ClientProject[]> {
    return Array.from(this.clientProjects.values())
      .filter((p) => p.clientEmail === email && p.isVisibleToClient)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClientProject(id: string): Promise<ClientProject | undefined> {
    return this.clientProjects.get(id);
  }

  async createClientProject(insertProject: InsertClientProject): Promise<ClientProject> {
    const id = randomUUID();
    const project: ClientProject = {
      ...insertProject,
      id,
      stage: insertProject.stage ?? "requirements_collected",
      progressPercent: insertProject.progressPercent ?? 0,
      milestones: insertProject.milestones ?? null,
      completedMilestones: insertProject.completedMilestones ?? null,
      uploadedFiles: insertProject.uploadedFiles ?? null,
      deadline: insertProject.deadline ?? null,
      adminComments: insertProject.adminComments ?? null,
      isVisibleToClient: insertProject.isVisibleToClient ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clientProjects.set(id, project);
    return project;
  }

  async updateClientProject(id: string, updates: Partial<ClientProject>): Promise<ClientProject | undefined> {
    const project = this.clientProjects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.clientProjects.set(id, updated);
    return updated;
  }

  async deleteClientProject(id: string): Promise<boolean> {
    return this.clientProjects.delete(id);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values())
      .filter((c) => c.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find((c) => c.email === email);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      phone: insertClient.phone ?? null,
      company: insertClient.company ?? null,
      isActive: insertClient.isActive ?? true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updated = { ...client, ...updates, updatedAt: new Date() };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter((c) => c.clientId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = {
      ...insertContract,
      id,
      projectId: insertContract.projectId ?? null,
      status: "draft",
      signedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    const updated = { ...contract, ...updates, updatedAt: new Date() };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: string): Promise<boolean> {
    return this.contracts.delete(id);
  }
}

export const storage = new MemStorage();
