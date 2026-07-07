
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VIXXY D\'ORANCE API',
      version: '1.0.0',
      description: 'Authentication and Authorization API for VIXXY D\'ORANCE e-commerce platform',
    },
    servers: [
      {
        url: env.backendUrl,
        description: env.nodeEnv === 'production' ? 'Production server' : 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
            },
            fullName: {
              type: 'string',
              example: 'Nguyen Van A',
            },
            phone: {
              type: 'string',
              example: '0901234567',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
            },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            fullName: {
              type: 'string',
              example: 'Nguyen Van A Updated',
            },
            phone: {
              type: 'string',
              example: '0901234568',
            },
            avatar: {
              type: 'string',
              example: 'https://example.com/avatar.jpg',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: {
                      type: 'string',
                    },
                    refreshToken: {
                      type: 'string',
                    },
                  },
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1,
                    },
                    email: {
                      type: 'string',
                      example: 'user@example.com',
                    },
                    fullName: {
                      type: 'string',
                      example: 'Nguyen Van A',
                    },
                    phone: {
                      type: 'string',
                      example: '0901234567',
                    },
                    role: {
                      type: 'string',
                      example: 'CUSTOMER',
                    },
                  },
                },
              },
            },
          },
        },
        ProfileResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User data fetched successfully',
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  example: 1,
                },
                email: {
                  type: 'string',
                  example: 'user@example.com',
                },
                fullName: {
                  type: 'string',
                  example: 'Nguyen Van A',
                },
                phone: {
                  type: 'string',
                  example: '0901234567',
                },
                avatar: {
                  type: 'string',
                  example: 'https://example.com/avatar.jpg',
                },
                role: {
                  type: 'string',
                  example: 'CUSTOMER',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Email is invalid',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints',
      },
    ],
  },
  apis: ['src/routes/*.ts', 'src/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
