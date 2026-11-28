// ----------------------------------------------------------------------------
// 1. LOCATION DOMAIN MODEL
// ----------------------------------------------------------------------------
export class Location {
  private latitude: number;
  private longitude: number;
  private radiusMeters: number;
  private addressName: string;

  constructor(
    latitude: number,
    longitude: number,
    radiusMeters: number = 50,
    addressName: string = ""
  ) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.radiusMeters = radiusMeters;
    this.addressName = addressName;
  }

  public getLatitude(): number {
    return this.latitude;
  }
  public getLongitude(): number {
    return this.longitude;
  }
  public getRadiusMeters(): number {
    return this.radiusMeters;
  }
  public getAddressName(): string {
    return this.addressName;
  }

  public distanceTo(other: Location): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (this.latitude * Math.PI) / 180;
    const phi2 = (other.latitude * Math.PI) / 180;
    const deltaPhi = ((other.latitude - this.latitude) * Math.PI) / 180;
    const deltaLambda = ((other.longitude - this.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  public contains(userLocation: Location): boolean {
    return this.distanceTo(userLocation) <= this.radiusMeters;
  }
}
