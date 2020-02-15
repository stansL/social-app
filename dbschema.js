let db = {
    users: [
        {
            userId: 'HsFa1lGl5OXXPnxHlVDbuM5Ovmq2',
            email: 'test@gmail.com',
            handle: 'test',
            createdAt: '2020-02-13T11:50:05.834Z',
            imgUrl: 'https://firebasestorage.googleapis.com/v0/b/minsocial-c1acc.appspot.com/o/stans.png?alt=media',
            bio: 'Hello, I am the first user and welcome to the social site',
            website: 'https://test.org',
            location: 'Nairobi, Kenya'
        }

    ],
    screams: [
        {
            userHandle: "user",
            body: "the scream body",
            createdAt: "2020-02-11T08:50:06.577Z",
            likeCount: 5,
            commentCount: 3
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'sdfasfdasdfsaf',
            body: 'some comment here',
            createdAt: '2020-02-11T08:50:06.577Z'
        }
    ]
}

let userDetails = {
    // redux data
    credentials: {
        userId: 'HsFa1lGl5OXXPnxHlVDbuM5Ovmq2',
        email: 'test@gmail.com',
        handle: 'test',
        createdAt: '2020-02-13T11:50:05.834Z',
        imgUrl: 'https://firebasestorage.googleapis.com/v0/b/minsocial-c1acc.appspot.com/o/stans.png?alt=media',
        bio: 'Hello, I am the first user and welcome to the social site',
        website: 'https://test.org',
        location: 'Nairobi, Kenya'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'HsFa1lGl5OaXXPnxHlVD'
        },
        {
            userHandle: 'user',
            screamId: 'HsFa1lGgl5OXXPnxHlVD'
        }
    ]
}