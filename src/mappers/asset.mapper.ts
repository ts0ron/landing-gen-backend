import { IAsset } from "../models/asset.model";
import { GoogleMapsService, GooglePlace } from "../services/googlemaps.service";

export class AssetMapper {
  /**
   * Maps a Google Place to our internal Asset format
   */
  static async mapGooglePlaceToAsset(
    place: GooglePlace,
    aiDescription?: string,
    aiTags?: string[],
    landingPage?: string,
    googleMapsService?: GoogleMapsService
  ): Promise<Partial<IAsset>> {
    if (!place.location) {
      throw new Error("Place location is missing");
    }

    // Handle photos with null checks
    const processedPhotos = place.photos?.map(async (photo) => {
      if (!photo.name || !photo.widthPx) return undefined;
      console.log("photo", photo);

      const photoUrl =
        googleMapsService && photo.name
          ? await googleMapsService.getPhotoUrl(
              photo.name,
              Math.min(photo.widthPx, 800) // Limit max width to 800px
            )
          : undefined;

      return {
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx ?? 0,
        authorAttributions:
          photo.authorAttributions?.map((attr) => ({
            displayName: attr.displayName ?? "",
            uri: attr.uri ?? "",
            photoUri: attr.photoUri ?? "",
          })) ?? [],
        photoUrl,
      };
    });

    const photos = processedPhotos
      ? (await Promise.all(processedPhotos)).filter(
          (p): p is NonNullable<typeof p> => p !== undefined
        )
      : undefined;

    // Handle options with null checks
    const parkingOptions = place.parkingOptions
      ? {
          freeParkingLot: place.parkingOptions.freeParkingLot ?? undefined,
          paidParkingLot: place.parkingOptions.paidParkingLot ?? undefined,
          freeStreetParking:
            place.parkingOptions.freeStreetParking ?? undefined,
          valetParking: place.parkingOptions.valetParking ?? undefined,
          freeGarageParking:
            place.parkingOptions.freeGarageParking ?? undefined,
          paidGarageParking:
            place.parkingOptions.paidGarageParking ?? undefined,
        }
      : undefined;

    const paymentOptions = place.paymentOptions
      ? {
          acceptsCreditCards:
            place.paymentOptions.acceptsCreditCards ?? undefined,
          acceptsDebitCards:
            place.paymentOptions.acceptsDebitCards ?? undefined,
          acceptsCashOnly: place.paymentOptions.acceptsCashOnly ?? undefined,
          acceptsNfc: place.paymentOptions.acceptsNfc ?? undefined,
        }
      : undefined;

    const accessibilityOptions = place.accessibilityOptions
      ? {
          wheelchairAccessibleParking:
            place.accessibilityOptions.wheelchairAccessibleParking ?? undefined,
          wheelchairAccessibleEntrance:
            place.accessibilityOptions.wheelchairAccessibleEntrance ??
            undefined,
          wheelchairAccessibleRestroom:
            place.accessibilityOptions.wheelchairAccessibleRestroom ??
            undefined,
          wheelchairAccessibleSeating:
            place.accessibilityOptions.wheelchairAccessibleSeating ?? undefined,
        }
      : undefined;

    // Handle price level
    const priceLevel =
      place.priceLevel && place.priceLevel !== "PRICE_LEVEL_UNSPECIFIED"
        ? (place.priceLevel as
            | "PRICE_LEVEL_FREE"
            | "PRICE_LEVEL_INEXPENSIVE"
            | "PRICE_LEVEL_MODERATE"
            | "PRICE_LEVEL_EXPENSIVE"
            | "PRICE_LEVEL_VERY_EXPENSIVE")
        : undefined;

    return {
      // Basic info
      externalId: place.id ?? "",
      displayName: place.displayName
        ? {
            text: place.displayName.text ?? "",
            languageCode: place.displayName.languageCode ?? "en",
          }
        : undefined,
      formattedAddress: place.formattedAddress ?? undefined,
      shortFormattedAddress: place.shortFormattedAddress ?? undefined,
      location: {
        latitude: place.location.latitude ?? 0,
        longitude: place.location.longitude ?? 0,
      },

      // Ratings and links
      rating: place.rating ?? undefined,
      userRatingCount: place.userRatingCount ?? undefined,
      googleMapsUri: place.googleMapsUri ?? undefined,
      websiteUri: place.websiteUri ?? undefined,

      // Opening hours
      regularOpeningHours: place.regularOpeningHours
        ? {
            periods:
              place.regularOpeningHours.periods?.map((period) => ({
                open: {
                  day: period.open?.day ?? 0,
                  hour: period.open?.hour ?? 0,
                  minute: period.open?.minute ?? 0,
                },
                close: {
                  day: period.close?.day ?? 0,
                  hour: period.close?.hour ?? 0,
                  minute: period.close?.minute ?? 0,
                },
              })) ?? [],
            weekdayDescriptions:
              place.regularOpeningHours.weekdayDescriptions ?? [],
          }
        : undefined,

      // Types
      primaryType: place.types?.[0] ?? undefined,
      types: place.types ?? undefined,

      // Photos
      photos,

      // Features and options
      parkingOptions,
      paymentOptions,
      accessibilityOptions,

      // Descriptions
      editorialSummary: place.editorialSummary
        ? {
            text: place.editorialSummary.text ?? "",
            languageCode: place.editorialSummary.languageCode ?? "en",
          }
        : undefined,
      priceLevel,

      // Reviews
      reviews:
        place.reviews?.map((review) => ({
          name: review.name ?? "",
          relativePublishTimeDescription:
            review.relativePublishTimeDescription ?? "",
          rating: review.rating ?? 0,
          text: {
            text: review.text?.text ?? "",
            languageCode: review.text?.languageCode ?? "en",
          },
          authorAttribution: {
            displayName: review.authorAttribution?.displayName ?? "",
            uri: review.authorAttribution?.uri ?? "",
            photoUri: review.authorAttribution?.photoUri ?? "",
          },
        })) ?? undefined,

      // Additional features
      allowsDogs: place.allowsDogs ?? undefined,

      // AI-generated content
      aiDescription,
      aiTags,
      aiLandingPage: landingPage,
    };
  }
}
