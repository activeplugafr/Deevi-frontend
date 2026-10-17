
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const statusCodes = new Counter('http_status_codes');

export const options = {
    stages: [
        { duration: '1m', target: 25 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 250 },
        { duration: '3m', target: 500 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<1000'],
    },
};

const BASE_URL = (
    __ENV.BASE_URL ||
    __ENV.NEXT_PUBLIC_DEEVI_API_URL ||
    'https://deevi-backend.onrender.com'
).replace(/\/+$/, '');

export default function () {
    const response = http.get(`${BASE_URL}/health`, {
        timeout: '15s',
        tags: { endpoint: 'health' },
    });

    statusCodes.add(1, {
        status: String(response.status),
    });

    check(response, {
        'health returns 2xx': (r) =>
            r.status >= 200 && r.status < 300,
    });

    sleep(1);
}






// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//     stages: [
//         { duration: '1m', target: 25 },
//         { duration: '2m', target: 100 },
//         { duration: '2m', target: 250 },
//         { duration: '3m', target: 500 },
//         { duration: '2m', target: 500 },
//         { duration: '1m', target: 0 },
//     ],
//     thresholds: {
//         http_req_failed: ['rate<0.01'],
//         http_req_duration: ['p(95)<1000'],
//     },
// };

// // const BASE_URL = __ENV.NEXT_PUBLIC_DEEVI_API_URL;

// const BASE_URL = (__ENV.NEXT_PUBLIC_DEEVI_API_URL || 'https://deevi-backend.onrender.com/').replace(/\/+$/, '');

// if (!BASE_URL) {
//     throw new Error(
//         'BASE_URL is missing. Run with -e BASE_URL=https://your-backend-url'
//     );
// }

// export default function () {
//     const response = http.get(`${BASE_URL}/health`);

//     check(response, {
//         'status is successful': (r) => r.status >= 200 && r.status < 300,
//     });

//     sleep(1);
// }