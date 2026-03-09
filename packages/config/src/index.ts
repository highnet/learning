export const ports = {
  web: 4000,
  cms: 4001,
  postgres: 6432,
  redis: 6379,
  rabbitmq: 5672,
  rabbitmqManagement: 15672,
} as const

export const serviceUrls = {
  web: 'http://localhost:4000',
  cms: 'http://localhost:4001',
  postgres: 'postgresql://postgres:postgres@localhost:6432/learning',
  redis: 'redis://localhost:6379',
  rabbitmq: 'amqp://guest:guest@localhost:5672',
  rabbitmqManagement: 'http://localhost:15672',
} as const
