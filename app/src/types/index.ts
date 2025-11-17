export interface Question {
    id: string;
    question: string;
    type: 'single_choice' | 'ranking' | 'checkboxes_text';
    options?: string[];
    hasOtherOption?: boolean;
    items?: string[];
    checkboxOptions?: string[];
}

export interface Review {
    author: string;
    quote: string;
    rating: number;
}

export interface Info {
    label: string;
    value: string;
    icon?: string;
}

export interface FoodItem {
    name: string;
    images: string[];
    reviews: Review[];
}

export interface AmbiencePhoto {
    imageUrl: string;
    review?: Review;
}

export interface Restaurant {
    id: string;
    name: string;
    rating: number;
    priceLevel: string;
    cuisine: string;
    heroImageUrl: string;
    ambientImageUrl: string;
    reviewQuote: string;
    reviewAuthor: string;
    infoList: Info[];
    instagramHandle?: string;
    tiktokHandle?: string;
    foodItems: FoodItem[];
    ambiencePhotos: AmbiencePhoto[];
    reviews: Review[];
    menuImages: string[];
    popularDishPhotos: string[];
    lat?: number;
    long?: number;
    address?: string;
}

export interface QuestionnaireAnswers {
    [key: string]:
        | string
        | string[]
        | { checkboxes: string[]; text: string }
        | null;
}
