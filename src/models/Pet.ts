import { TaskObserver, PetState, Task, Accessory } from "../models/";

// ----------------------------------------------------------------------------
// 3. VIRTUAL PET MODEL (IMPLEMENTS OBSERVER)
// ----------------------------------------------------------------------------
export class Pet implements TaskObserver {
  private petId: string;
  private name: string;
  private currentHealth: number;
  private maxHealth: number;
  private state: PetState;
  private coins: number;
  private recoveryStreakDays: number;
  private equippedAccessories: Map<string, Accessory>;

  constructor(petId: string, name: string, maxHealth: number = 100) {
    this.petId = petId;
    this.name = name;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.state = PetState.REGULAR;
    this.coins = 0;
    this.recoveryStreakDays = 0;
    this.equippedAccessories = new Map<string, Accessory>();
  }

  public getPetId(): string {
    return this.petId;
  }
  public getName(): string {
    return this.name;
  }
  public getCurrentHealth(): number {
    return this.currentHealth;
  }
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  public getState(): PetState {
    return this.state;
  }
  public getCoins(): number {
    return this.coins;
  }

  public applyHealthChange(amount: number): void {
    this.currentHealth = Math.min(
      this.maxHealth,
      Math.max(0, this.currentHealth + amount)
    );
    this.checkStateTransition();
  }

  public checkStateTransition(): void {
    const healthPercentage = (this.currentHealth / this.maxHealth) * 100;

    if (healthPercentage === 0) {
      this.state = PetState.DEAD_PASSED_OUT;
    } else if (healthPercentage < 40) {
      this.state = PetState.DYING;
    } else if (healthPercentage < 66) {
      this.state = PetState.SAD;
    } else if (healthPercentage < 95) {
      this.state = PetState.REGULAR;
    } else {
      this.state = PetState.HYPED;
    }
  }

  public addCoins(amount: number): void {
    if (amount > 0) this.coins += amount;
  }

  public deductCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  public equipAccessory(acc: Accessory): void {
    this.equippedAccessories.set(acc.getSlot(), acc);
    acc.equip();
  }

  public unequipAccessory(slot: string): void {
    this.equippedAccessories.delete(slot);
  }

  public recoverFromPassOut(): void {
    if (this.state === PetState.DEAD_PASSED_OUT) {
      this.currentHealth = Math.floor(this.maxHealth * 0.5);
      this.checkStateTransition();
    }
  }

  // Observer Callbacks
  public onTaskCompleted(task: Task): void {
    this.addCoins(task.calculateRewardCoins());
    this.applyHealthChange(10);
  }

  public onTaskExpired(task: Task): void {
    this.applyHealthChange(-task.getHealthPenalty());
  }
}
