import { AppDataSource } from "../config/database";
import { Denomination, Branch } from "../models/church";

export class ChurchService {
  private readonly denomRepo = AppDataSource.getRepository(Denomination);
  private readonly branchRepo = AppDataSource.getRepository(Branch);

  // ─── Denomination CRUD ────────────────────────────────────────────────────

  async create(data: {
    denomination_name: string;
    description?: string;
    location?: string;
    state?: string;
    country?: string;
    address?: string;
    admin_id: string;
  }): Promise<Denomination> {
    const denom = this.denomRepo.create(data);
    return this.denomRepo.save(denom);
  }

  async findAll(): Promise<Denomination[]> {
    return this.denomRepo.find({
      relations: ["admin", "branches"],
      order: { created_at: "DESC" },
    });
  }

  async findById(id: string): Promise<Denomination | null> {
    return this.denomRepo.findOne({
      where: { id },
      relations: ["admin", "branches"],
    });
  }

  async update(
    id: string,
    data: Partial<Pick<Denomination, "denomination_name" | "description" | "location" | "state" | "country" | "address">>
  ): Promise<Denomination | null> {
    const denom = await this.denomRepo.findOneBy({ id });
    if (!denom) return null;
    Object.assign(denom, data);
    return this.denomRepo.save(denom);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.denomRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.denomRepo.count();
  }

  // ─── Branch CRUD ──────────────────────────────────────────────────────────

  async createBranch(data: {
    denomination_id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pastor_name?: string;
    description?: string;
    is_headquarters?: boolean;
  }): Promise<Branch> {
    // Ensure denomination exists
    const denom = await this.denomRepo.findOneBy({ id: data.denomination_id });
    if (!denom) throw new Error("Denomination not found");
    const branch = this.branchRepo.create(data);
    return this.branchRepo.save(branch);
  }

  async findBranchesByDenomination(denomination_id: string): Promise<Branch[]> {
    return this.branchRepo.find({
      where: { denomination_id },
      order: { created_at: "DESC" },
    });
  }

  async findBranchById(id: string): Promise<Branch | null> {
    return this.branchRepo.findOne({
      where: { id },
      relations: ["denomination"],
    });
  }

  async updateBranch(
    id: string,
    data: Partial<Pick<Branch, "name" | "address" | "city" | "state" | "country" | "pastor_name" | "description" | "is_headquarters">>
  ): Promise<Branch | null> {
    const branch = await this.branchRepo.findOneBy({ id });
    if (!branch) return null;
    Object.assign(branch, data);
    return this.branchRepo.save(branch);
  }

  async deleteBranch(id: string): Promise<boolean> {
    const result = await this.branchRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

