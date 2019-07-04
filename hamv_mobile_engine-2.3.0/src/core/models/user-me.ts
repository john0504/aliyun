export interface UserMe {
  alexa_link: AlexaLink;
  id: string;
  email: string;
  name: string;
  status: number;
}

export interface AlexaLink {
  status: number;
}