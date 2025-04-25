import { Place as GooglePlace } from "@googlemaps/google-maps-services-js";
import { IAsset, IPlacePhoto } from "../models/asset.model";
import { GoogleMapsService } from "../services/googlemaps.service";
import { GooglePlaceDetails } from "../models/google-place.model";
import { logger } from "../utils/logger";

export class AssetMapper {
  /**
   * Maps a Google Place to our internal Asset schema
   * @param place - Google Place Details object
   * @param placeId - Optional place ID (used as fallback)
   * @param googleMapsService - GoogleMapsService instance for fetching additional data
   */
  static toAsset(
    place: GooglePlaceDetails,
    aiDescription: string,
    aiTags: string[],
    googleMapsService?: GoogleMapsService
  ): Partial<IAsset> {
    if (!place.geometry?.location) {
      throw new Error("Place geometry or location is missing");
    }

    return {
      placeId: place.place_id!,
      name: place.name || "",
      formattedAddress: place.formatted_address || "",

      // Address information
      addressComponents: place.address_components?.map((component) => ({
        long_name: component.long_name,
        short_name: component.short_name,
        types: component.types,
      })),
      adrAddress: place.adr_address,

      // Business information
      businessStatus: place.business_status,
      permanentlyClosed: place.permanently_closed,

      // Geometry
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        ...(place.geometry.viewport && {
          viewport: {
            northeast: {
              lat: place.geometry.viewport.northeast.lat,
              lng: place.geometry.viewport.northeast.lng,
            },
            southwest: {
              lat: place.geometry.viewport.southwest.lat,
              lng: place.geometry.viewport.southwest.lng,
            },
          },
        }),
      },

      // Icons
      icon: place.icon,
      iconBackgroundColor: place.icon_background_color,
      iconMaskBaseUri: place.icon_mask_base_uri,

      // Photos
      photos:
        place.photos?.map((photo): IPlacePhoto => {
          const photoData: IPlacePhoto = {
            photoReference: photo.photo_reference || "",
            height: photo.height || 0,
            width: photo.width || 0,
          };

          if (googleMapsService && photo.photo_reference) {
            photoData.photoUri = googleMapsService.getPhotoUrl(
              photo.photo_reference,
              Math.min(photo.width || 800, 800) // Limit max width to 800px
            );
          }

          return photoData;
        }) || [],

      // Location codes and types
      plusCode: place.plus_code
        ? {
            global_code: place.plus_code.global_code,
            compound_code: place.plus_code.compound_code,
          }
        : undefined,
      types: place.types || [],
      url: place.url,
      utcOffset: place.utc_offset,
      vicinity: place.vicinity,

      // Contact information
      formattedPhoneNumber: place.formatted_phone_number,
      internationalPhoneNumber: place.international_phone_number,
      website: place.website,

      // Opening hours
      openingHours: place.opening_hours
        ? {
            open_now: place.opening_hours.open_now,
            periods: place.opening_hours.periods?.map((period) => ({
              open: {
                day: period.open.day,
                time: period.open.time || "",
              },
              close: period.close
                ? {
                    day: period.close.day,
                    time: period.close.time || "",
                  }
                : undefined,
            })),
            weekday_text: place.opening_hours.weekday_text,
          }
        : undefined,

      // Ratings and reviews
      priceLevel: place.price_level,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      reviews: place.reviews?.map((review) => ({
        author_name: review.author_name,
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        time:
          typeof review.time === "string"
            ? parseInt(review.time, 10)
            : review.time,
        text: review.text,
      })),

      // Accessibility
      wheelchairAccessibleEntrance: Boolean(
        (place as any).wheelchair_accessible_entrance
      ),
      aiDescription: aiDescription,
      aiTags: aiTags,
    };
  }
}
