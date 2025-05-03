export const userPromptTemplate = `
I have information about a place that I'd like you to analyze and respond to based on the following data:

## Basic Information
- Name: {{name}}
- Address: {{formattedAddress}}
- Place ID: {{placeId}}
- Business Status: {{businessStatus}}
- Types: {{types}}
- Price Level: {{priceLevel}} (on a scale of 1-4, where 1 is least expensive)
- Rating: {{rating}} (out of 5 stars)
- Total Ratings: {{userRatingsTotal}}
- Website: {{website}}

## Contact Information
- Phone: {{formattedPhoneNumber}}
- International Phone: {{internationalPhoneNumber}}

## Location
- Coordinates: Latitude {{geometry.location.lat}}, Longitude {{geometry.location.lng}}
- Vicinity: {{vicinity}}

## Accessibility
- Wheelchair Accessible Entrance: {{wheelchairAccessibleEntrance}}

## Hours of Operation
{{#if openingHours.weekday_text}}
{{#each openingHours.weekday_text}}
- {{this}}
{{/each}}
{{else}}
- Hours information not available
{{/if}}

## Photos
{{#if photos}}
This place has {{photos.length}} photos available.
{{else}}
No photos are available for this place.
{{/if}}

## Reviews
{{#if reviews}}
Here are the most recent reviews:
{{#each reviews}}
### Review by {{author_name}} ({{rating}}/5 stars) - {{relative_time_description}}
"{{text}}"
{{/each}}
{{else}}
No reviews are available for this place.
{{/if}}

## Request Type: {{requestType}}
{{requestDetails}}
`;

export default userPromptTemplate;
