import { User, Pet } from "../models/";

// ----------------------------------------------------------------------------
// 5. SHOP & ITEM HIERARCHY
// ----------------------------------------------------------------------------
export enum ItemType {
  ACCESSORY = "ACCESSORY",
  FREEBE_DAY = "FREEBE_DAY",
  THEME = "THEME",
}

export abstract class Item {
  private itemId: string;
  private name: string;
  private priceInCoins: number;
  private itemType: ItemType;

  constructor(
    itemId: string,
    name: string,
    priceInCoins: number,
    itemType: ItemType
  ) {
    this.itemId = itemId;
    this.name = name;
    this.priceInCoins = priceInCoins;
    this.itemType = itemType;
  }

  public getItemId(): string {
    return this.itemId;
  }
  public getName(): string {
    return this.name;
  }
  public getPriceInCoins(): number {
    return this.priceInCoins;
  }
  public getItemType(): ItemType {
    return this.itemType;
  }

  public abstract applyEffect(pet: Pet): void;
}

export class Accessory extends Item {
  private slot: string;

  constructor(
    itemId: string,
    name: string,
    priceInCoins: number,
    slot: string
  ) {
    super(itemId, name, priceInCoins, ItemType.ACCESSORY);
    this.slot = slot;
  }

  public getSlot(): string {
    return this.slot;
  }

  public equip(): void {}

  public applyEffect(pet: Pet): void {
    pet.equipAccessory(this);
  }
}

export class FreeBeDay extends Item {
  private inactiveDaysProtected: number;

  constructor(
    itemId: string,
    name: string,
    priceInCoins: number,
    inactiveDaysProtected: number = 1
  ) {
    super(itemId, name, priceInCoins, ItemType.FREEBE_DAY);
    this.inactiveDaysProtected = inactiveDaysProtected;
  }

  public consume(): void {}

  public applyEffect(pet: Pet): void {
    this.consume();
  }
}

export class Shop {
  private shopId: string;
  private catalogItems: Item[];

  constructor(shopId: string) {
    this.shopId = shopId;
    this.catalogItems = [];
  }

  public getCatalog(): Item[] {
    return this.catalogItems;
  }

  public addItemToCatalog(item: Item): void {
    this.catalogItems.push(item);
  }

  public purchaseItem(user: User, item: Item): boolean {
    const pet = user.getPet();
    if (pet.deductCoins(item.getPriceInCoins())) {
      user.addItemToInventory(item);
      item.applyEffect(pet);
      return true;
    }
    return false;
  }
}
