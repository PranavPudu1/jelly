model Restaurant:
ID: UUID
name: string
rating: number
lat: number
long: number
address: string
mapLink?: string
price: string
phoneNumber: string
dateAdded: Date
images: RestaurantImage[]
reviews: Review[]
menu: MenuItem[]
socialMedia: SocialPost[]
tags: Tag[]
sourceId?: string
source?: string


model Tag
ID: UUID
tagType: TagType
value: string
source?: string
dateAdded: Date


model RestaurantImage
ID: UUID
url: string
tags: Tag[]
sourceId?: string
source?: string
dateAdded: Date


model Review
ID: UUID
review: string
rating: number
tags: Tag[]
images?: RestaurantImage[]
sourceId?: string
source?: string
postedBy?: string
dateAdded: Date


model TagType
ID: UUID
value: string
dateAdded: Date


model MenuItem
ID: UUID
source?: string
sourceId?: string
images: RestaurantImage[]
tags: Tag[]
dateAdded: Date


model SocialPost
ID: UUID
source: string
url: string
dateAdded: Date
valid: boolean
tags: Tag[]
