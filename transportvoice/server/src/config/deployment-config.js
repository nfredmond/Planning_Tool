// database/migrations/01_initial_schema.js
/**
 * Initial database schema migration
 */
module.exports = {
  async up(db) {
    // Create collections with validators
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role', 'verified'],
          properties: {
            email: {
              bsonType: 'string',
              description: 'Email address must be a string and is required'
            },
            password: {
              bsonType: 'string',
              description: 'Password hash must be a string and is required'
            },
            firstName: {
              bsonType: 'string',
              description: 'First name must be a string and is required'
            },
            lastName: {
              bsonType: 'string',
              description: 'Last name must be a string and is required'
            },
            role: {
              enum: ['admin', 'moderator', 'user'],
              description: 'Role must be one of the enum values and is required'
            },
            organization: {
              bsonType: 'string',
              description: 'Organization must be a string if provided'
            },
            verified: {
              bsonType: 'bool',
              description: 'Verified flag must be a boolean and is required'
            },
            verificationToken: {
              bsonType: 'string',
              description: 'Verification token must be a string if provided'
            },
            resetPasswordToken: {
              bsonType: 'string',
              description: 'Reset password token must be a string if provided'
            },
            resetPasswordExpires: {
              bsonType: 'date',
              description: 'Reset password expiration must be a date if provided'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    await db.createCollection('projects', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'description', 'slug', 'startDate', 'status', 'basemap', 'owner', 'settings'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Project name must be a string and is required'
            },
            description: {
              bsonType: 'string',
              description: 'Description must be a string and is required'
            },
            slug: {
              bsonType: 'string',
              description: 'Slug must be a string and is required'
            },
            startDate: {
              bsonType: 'date',
              description: 'Start date must be a date and is required'
            },
            endDate: {
              bsonType: 'date',
              description: 'End date must be a date if provided'
            },
            status: {
              enum: ['draft', 'active', 'archived'],
              description: 'Status must be one of the enum values and is required'
            },
            basemap: {
              bsonType: 'string',
              description: 'Basemap must be a string and is required'
            },
            layers: {
              bsonType: 'array',
              description: 'Layers must be an array'
            },
            bounds: {
              bsonType: 'object',
              description: 'Bounds must be an object if provided'
            },
            owner: {
              bsonType: 'objectId',
              description: 'Owner must be an ObjectId and is required'
            },
            organization: {
              bsonType: 'string',
              description: 'Organization must be a string if provided'
            },
            settings: {
              bsonType: 'object',
              required: ['allowAnonymousComments', 'requireModeration', 'enableAIModeration', 'enableVoting', 'enableImageUploads', 'enableSocialSharing'],
              properties: {
                allowAnonymousComments: {
                  bsonType: 'bool',
                  description: 'Allow anonymous comments flag must be a boolean and is required'
                },
                requireModeration: {
                  bsonType: 'bool',
                  description: 'Require moderation flag must be a boolean and is required'
                },
                enableAIModeration: {
                  bsonType: 'bool',
                  description: 'Enable AI moderation flag must be a boolean and is required'
                },
                aiProvider: {
                  bsonType: 'string',
                  description: 'AI provider ID must be a string if provided'
                },
                enableVoting: {
                  bsonType: 'bool',
                  description: 'Enable voting flag must be a boolean and is required'
                },
                enableImageUploads: {
                  bsonType: 'bool',
                  description: 'Enable image uploads flag must be a boolean and is required'
                },
                enableSocialSharing: {
                  bsonType: 'bool',
                  description: 'Enable social sharing flag must be a boolean and is required'
                }
              }
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['project', 'anonymous', 'location', 'content', 'status', 'aiModerated', 'votes'],
          properties: {
            project: {
              bsonType: 'objectId',
              description: 'Project ID must be an ObjectId and is required'
            },
            user: {
              bsonType: 'objectId',
              description: 'User ID must be an ObjectId if provided'
            },
            anonymous: {
              bsonType: 'bool',
              description: 'Anonymous flag must be a boolean and is required'
            },
            anonymousName: {
              bsonType: 'string',
              description: 'Anonymous name must be a string if provided'
            },
            location: {
              bsonType: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  enum: ['Point'],
                  description: 'Type must be Point and is required'
                },
                coordinates: {
                  bsonType: 'array',
                  description: 'Coordinates must be an array and is required'
                }
              }
            },
            content: {
              bsonType: 'string',
              description: 'Content must be a string and is required'
            },
            images: {
              bsonType: 'array',
              description: 'Images must be an array of strings'
            },
            category: {
              bsonType: 'string',
              description: 'Category must be a string if provided'
            },
            status: {
              enum: ['pending', 'approved', 'rejected'],
              description: 'Status must be one of the enum values and is required'
            },
            moderationNotes: {
              bsonType: 'string',
              description: 'Moderation notes must be a string if provided'
            },
            moderatedBy: {
              bsonType: 'objectId',
              description: 'Moderator ID must be an ObjectId if provided'
            },
            moderatedAt: {
              bsonType: 'date',
              description: 'Moderation date must be a date if provided'
            },
            aiModerated: {
              bsonType: 'bool',
              description: 'AI moderated flag must be a boolean and is required'
            },
            aiModerationScore: {
              bsonType: 'double',
              description: 'AI moderation score must be a double if provided'
            },
            aiModerationNotes: {
              bsonType: 'string',
              description: 'AI moderation notes must be a string if provided'
            },
            votes: {
              bsonType: 'object',
              required: ['upvotes', 'downvotes', 'voters'],
              properties: {
                upvotes: {
                  bsonType: 'int',
                  description: 'Upvotes must be an integer and is required'
                },
                downvotes: {
                  bsonType: 'int',
                  description: 'Downvotes must be an integer and is required'
                },
                voters: {
                  bsonType: 'array',
                  description: 'Voters must be an array and is required'
                }
              }
            },
            parentComment: {
              bsonType: 'objectId',
              description: 'Parent comment ID must be an ObjectId if provided'
            },
            replies: {
              bsonType: 'array',
              description: 'Replies must be an array of ObjectIds'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    await db.createCollection('layers', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'type', 'url', 'owner', 'public', 'projects'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Layer name must be a string and is required'
            },
            description: {
              bsonType: 'string',
              description: 'Description must be a string if provided'
            },
            type: {
              enum: ['kml', 'kmz', 'geojson', 'wms', 'vector', 'raster'],
              description: 'Type must be one of the enum values and is required'
            },
            fileName: {
              bsonType: 'string',
              description: 'File name must be a string if provided'
            },
            fileSize: {
              bsonType: 'int',
              description: 'File size must be an integer if provided'
            },
            url: {
              bsonType: 'string',
              description: 'URL must be a string and is required'
            },
            owner: {
              bsonType: 'objectId',
              description: 'Owner must be an ObjectId and is required'
            },
            organization: {
              bsonType: 'string',
              description: 'Organization must be a string if provided'
            },
            public: {
              bsonType: 'bool',
              description: 'Public flag must be a boolean and is required'
            },
            projects: {
              bsonType: 'array',
              description: 'Projects must be an array of ObjectIds and is required'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    await db.createCollection('aiproviders', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'provider', 'model', 'owner', 'settings'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Provider name must be a string and is required'
            },
            provider: {
              enum: ['openai', 'anthropic', 'huggingface', 'custom'],
              description: 'Provider type must be one of the enum values and is required'
            },
            apiKey: {
              bsonType: 'string',
              description: 'API key must be a string if provided'
            },
            model: {
              bsonType: 'string',
              description: 'Model must be a string and is required'
            },
            baseUrl: {
              bsonType: 'string',
              description: 'Base URL must be a string if provided'
            },
            settings: {
              bsonType: 'object',
              description: 'Settings must be an object and is required'
            },
            owner: {
              bsonType: 'objectId',
              description: 'Owner must be an ObjectId and is required'
            },
            organization: {
              bsonType: 'string',
              description: 'Organization must be a string if provided'
            },
            projects: {
              bsonType: 'array',
              description: 'Projects must be an array of ObjectIds'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    await db.createCollection('reports', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'project', 'type', 'parameters', 'createdBy'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Report name must be a string and is required'
            },
            description: {
              bsonType: 'string',
              description: 'Description must be a string if provided'
            },
            project: {
              bsonType: 'objectId',
              description: 'Project ID must be an ObjectId and is required'
            },
            type: {
              enum: ['comments', 'engagement', 'sentiment', 'geographic', 'custom'],
              description: 'Type must be one of the enum values and is required'
            },
            parameters: {
              bsonType: 'object',
              description: 'Parameters must be an object and is required'
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'Creator ID must be an ObjectId and is required'
            },
            lastRun: {
              bsonType: 'date',
              description: 'Last run date must be a date if provided'
            },
            schedule: {
              bsonType: 'object',
              description: 'Schedule must be an object if provided'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created date must be a date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated date must be a date'
            }
          }
        }
      }
    });

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ verificationToken: 1 }, { sparse: true });
    await db.collection('users').createIndex({ resetPasswordToken: 1 }, { sparse: true });

    await db.collection('projects').createIndex({ slug: 1 }, { unique: true });
    await db.collection('projects').createIndex({ owner: 1 });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ 'settings.aiProvider': 1 }, { sparse: true });

    await db.collection('comments').createIndex({ project: 1 });
    await db.collection('comments').createIndex({ user: 1 }, { sparse: true });
    await db.collection('comments').createIndex({ status: 1 });
    await db.collection('comments').createIndex({ parentComment: 1 }, { sparse: true });
    await db.collection('comments').createIndex({ 'location': '2dsphere' });
    await db.collection('comments').createIndex({ createdAt: -1 });

    await db.collection('layers').createIndex({ owner: 1 });
    await db.collection('layers').createIndex({ projects: 1 });
    await db.collection('layers').createIndex({ public: 1 });

    await db.collection('aiproviders').createIndex({ owner: 1 });
    await db.collection('aiproviders').createIndex({ projects: 1 });

    await db.collection('reports').createIndex({ project: 1 });
    await db.collection('reports').createIndex({ createdBy: 1 });
    await db.collection('reports').createIndex({ type: 1 });
  },

  async down(db) {
    // Drop collections in reverse dependency order
    await db.collection('reports').drop();
    await db.collection('aiproviders').drop();
    await db.collection('layers').drop();
    await db.collection('comments').drop();
    await db.collection('projects').drop();
    await db.collection('users').drop();
  }
};

// database/migrations/02_create_admin_user.js
/**
 * Create initial admin user
 */
const bcrypt = require('bcrypt');

module.exports = {
  async up(db) {
    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@transportvoice.org' });
    
    if (!existingAdmin) {
      // Generate hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      // Create admin user
      await db.collection('users').insertOne({
        email: 'admin@transportvoice.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  },

  async down(db) {
    // Remove admin user
    await db.collection('users').deleteOne({ email: 'admin@transportvoice.org' });
  }
};

// database/migrations/03_create_demo_data.js
/**
 * Create demo data for development and testing
 */
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = {
  async up(db) {
    // Check if demo data already exists
    const existingProject = await db.collection('projects').findOne({ slug: 'downtown-bike-lane-project' });
    
    if (existingProject) {
      console.log('Demo data already exists.');
      return;
    }
    
    console.log('Creating demo data...');
    
    // Create demo users
    const salt = await bcrypt.genSalt(10);
    
    const users = [
      {
        _id: new ObjectId(),
        email: 'planner@transportvoice.org',
        password: await bcrypt.hash('Planner123!', salt),
        firstName: 'Jane',
        lastName: 'Planner',
        role: 'moderator',
        organization: 'City Planning Department',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'citizen@transportvoice.org',
        password: await bcrypt.hash('Citizen123!', salt),
        firstName: 'John',
        lastName: 'Citizen',
        role: 'user',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('Demo users created.');
    
    // Create demo AI provider
    const aiProvider = {
      _id: new ObjectId(),
      name: 'Demo OpenAI Integration',
      provider: 'openai',
      apiKey: 'sk-demo-key-not-real', // Not a real key
      model: 'gpt-4',
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      },
      owner: users[0]._id, // Planner
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('aiproviders').insertOne(aiProvider);
    console.log('Demo AI provider created.');
    
    // Create demo project
    const project = {
      _id: new ObjectId(),
      name: 'Downtown Bike Lane Project',
      description: 'A project to design and implement new bike lanes in the downtown area. We are seeking community input on the proposed routes, safety concerns, and design preferences.',
      slug: 'downtown-bike-lane-project',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: 'active',
      basemap: 'streets',
      layers: [],
      bounds: {
        north: 40.745,
        east: -73.97,
        south: 40.735,
        west: -74.0
      },
      owner: users[0]._id, // Planner
      organization: 'City Planning Department',
      settings: {
        allowAnonymousComments: true,
        requireModeration: true,
        enableAIModeration: true,
        aiProvider: aiProvider._id.toString(),
        enableVoting: true,
        enableImageUploads: true,
        enableSocialSharing: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('projects').insertOne(project);
    console.log('Demo project created.');
    
    // Update AI provider with project reference
    await db.collection('aiproviders').updateOne(
      { _id: aiProvider._id },
      { $set: { projects: [project._id] } }
    );
    
    // Create demo layers
    const layers = [
      {
        _id: new ObjectId(),
        name: 'Existing Bike Lanes',
        description: 'Current bike infrastructure in the city',
        type: 'geojson',
        fileName: 'existing-bike-lanes.geojson',
        fileSize: 24680,
        url: '/uploads/layers/existing-bike-lanes.geojson',
        owner: users[0]._id, // Planner
        organization: 'City Planning Department',
        public: true,
        projects: [project._id],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Proposed Routes',
        description: 'Proposed new bike lane routes',
        type: 'geojson',
        fileName: 'proposed-routes.geojson',
        fileSize: 18420,
        url: '/uploads/layers/proposed-routes.geojson',
        owner: users[0]._id, // Planner
        organization: 'City Planning Department',
        public: true,
        projects: [project._id],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('layers').insertMany(layers);
    console.log('Demo layers created.');
    
    // Update project with layer references
    await db.collection('projects').updateOne(
      { _id: project._id },
      {
        $set: {
          layers: layers.map(layer => ({
            name: layer.name,
            type: layer.type,
            url: layer.url,
            visible: true,
            opacity: 0.8
          }))
        }
      }
    );
    
    // Create demo comments
    const comments = [
      {
        _id: new ObjectId(),
        project: project._id,
        user: users[1]._id, // Citizen
        anonymous: false,
        location: {
          type: 'Point',
          coordinates: [-73.985, 40.74] // Longitude, Latitude
        },
        content: 'I think we need more protected bike lanes here. The current shared lanes are dangerous with the amount of traffic.',
        images: [],
        category: 'safety',
        status: 'approved',
        moderatedBy: users[0]._id, // Planner
        moderatedAt: new Date(),
        aiModerated: true,
        aiModerationScore: 0.95,
        aiModerationNotes: 'Comment is appropriate and relevant to the project.',
        votes: {
          upvotes: 5,
          downvotes: 1,
          voters: [
            {
              user: users[0]._id, // Planner
              vote: 'up',
              createdAt: new Date()
            }
          ]
        },
        replies: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        project: project._id,
        anonymous: true,
        anonymousName: 'Concerned Cyclist',
        location: {
          type: 'Point',
          coordinates: [-73.979, 40.738] // Longitude, Latitude
        },
        content: 'The intersection at 5th Ave is particularly dangerous. I've had several near-misses with turning vehicles. Could we add a bike-specific signal here?',
        images: [],
        category: 'safety',
        status: 'approved',
        moderatedBy: users[0]._id, // Planner
        moderatedAt: new Date(),
        aiModerated: true,
        aiModerationScore: 0.92,
        aiModerationNotes: 'Comment is appropriate and focuses on safety concerns.',
        votes: {
          upvotes: 8,
          downvotes: 0,
          voters: [
            {
              user: users[1]._id, // Citizen
              vote: 'up',
              createdAt: new Date()
            }
          ]
        },
        replies: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        project: project._id,
        anonymous: true,
        anonymousName: 'Local Business Owner',
        location: {
          type: 'Point',
          coordinates: [-73.982, 40.742] // Longitude, Latitude
        },
        content: 'I support the bike lanes but am concerned about the loss of parking spaces in front of businesses. Could there be a compromise design that preserves some parking?',
        images: [],
        category: 'general',
        status: 'pending',
        aiModerated: false,
        votes: {
          upvotes: 0,
          downvotes: 0,
          voters: []
        },
        replies: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    await db.collection('comments').insertMany(comments);
    console.log('Demo comments created.');
    
    // Create demo report
    const report = {
      _id: new ObjectId(),
      name: 'Bike Lane Project Feedback Summary',
      description: 'Summary of community feedback on the downtown bike lane project',
      project: project._id,
      type: 'comments',
      parameters: {
        sortBy: 'newest',
        limit: 100,
        includeAISummary: true
      },
      createdBy: users[0]._id, // Planner
      lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      schedule: {
        enabled: true,
        frequency: 'weekly',
        nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        recipients: ['planner@transportvoice.org']
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    };
    
    await db.collection('reports').insertOne(report);
    console.log('Demo report created.');
    
    console.log('Demo data creation completed successfully.');
  },

  async down(db) {
    // Remove demo data
    await db.collection('reports').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('layers').deleteMany({});
    await db.collection('projects').deleteMany({ slug: 'downtown-bike-lane-project' });
    await db.collection('aiproviders').deleteMany({});
    await db.collection('users').deleteMany({
      email: { $in: ['planner@transportvoice.org', 'citizen@transportvoice.org'] }
    });
    
    console.log('Demo data removed.');
  }
};

// docker/docker-compose.yml
version: '3.8'

services:
  # MongoDB service
  mongodb:
    image: mongo:5.0
    container_name: transportvoice-mongodb
    restart: always
    volumes:
      - mongodb-data:/data/db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-password}
      MONGO_INITDB_DATABASE: transportvoice
    networks:
      - transportvoice-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 10s
      retries: 5

  # Backend service
  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.server
    container_name: transportvoice-backend
    restart: always
    depends_on:
      mongodb:
        condition: service_healthy
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 5000
      MONGO_URI: mongodb://${MONGO_USERNAME:-transportvoice}:${MONGO_PASSWORD:-tv-password}@mongodb:27017/transportvoice?authSource=admin
      JWT_SECRET: ${JWT_SECRET:-changeme}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-1d}
      CLIENT_URL: ${CLIENT_URL:-http://localhost:3000}
      EMAIL_HOST: ${EMAIL_HOST:-smtp.example.com}
      EMAIL_PORT: ${EMAIL_PORT:-587}
      EMAIL_USER: ${EMAIL_USER:-user}
      EMAIL_PASS: ${EMAIL_PASS:-password}
      EMAIL_FROM: ${EMAIL_FROM:-noreply@transportvoice.org}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY:-changeme}
    volumes:
      - ../uploads:/app/uploads
      - backend-logs:/app/logs
    networks:
      - transportvoice-network

  # Frontend service
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.client
    container_name: transportvoice-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      REACT_APP_API_URL: ${API_URL:-http://localhost:5000/api}
      REACT_APP_MAPBOX_TOKEN: ${MAPBOX_TOKEN:-your-mapbox-token}
    networks:
      - transportvoice-network

  # Nginx service for reverse proxy (optional, used in production)
  nginx:
    image: nginx:alpine
    container_name: transportvoice-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend
    networks:
      - transportvoice-network
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"

  # Certbot service for SSL certificates (optional, used in production)
  certbot:
    image: certbot/certbot
    container_name: transportvoice-certbot
    volumes:
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  mongodb-data:
  backend-logs:

networks:
  transportvoice-network:
    driver: bridge

# docker/Dockerfile.server
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images uploads/layers

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "run", "start:prod"]

# docker/Dockerfile.client
# Build stage
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Install dependencies
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Copy source code
COPY client/ ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# docker/nginx/default.conf
server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Forward API requests to backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# docker/nginx/production.conf
server {
    listen 80;
    listen [::]:80;
    server_name transportvoice.org www.transportvoice.org;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }

    # Let's Encrypt HTTP challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name transportvoice.org www.transportvoice.org;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/transportvoice.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/transportvoice.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # HSTS configuration
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory for the frontend
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Forward API requests to backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Enable gzip compression
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;
    gzip_vary on;
}
