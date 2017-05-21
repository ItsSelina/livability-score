# Livability Score

The Livabilty Score API determines how livable a location is based on crime rates, walkscore, and availability of restaurants and recreation.

## Usage

GET: `https://livabilityapi.com/score?lat=37.763767&lng=-122.4282297`

```
{
  "livabilityScore": 82,
  "walkScore": 98,
  "transitScore": 100,
  "restaurantScore": 84,
  "recreationScore": 100,
  "crimeScore": 45
}
```
