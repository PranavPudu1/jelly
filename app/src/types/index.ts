export interface Question {
    id: string;
    question: string;
    type: 'single_choice' | 'ranking' | 'checkboxes_text' | 'text';
    options?: string[];
    hasOtherOption?: boolean;
    items?: string[];
    checkboxOptions?: string[];
    placeholder?: string;
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
    distance: number;
    price: string;
    rating: number;
    heroImage: string;
    ambientImages: string[];
    popularDishPhotos: string[];
    menu: any[];
    topReview: Review;
    cuisine: string[];
    socialMedia: {
        instagram: string | null;
        tiktok: string | null;
    };
    address: string;
    phoneNumber: string;
    lat: number;
    long: number;
    mapLink: string;
}

export interface QuestionnaireAnswers {
    [key: string]:
        | string
        | string[]
        | { checkboxes: string[]; text: string }
        | null;
}
