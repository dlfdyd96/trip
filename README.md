# 너의 일정을 짜고 싶어
## **Server** 📖
### 🔨 개발 도구
#### Node.js + Express<br>
  
```
"dependencies": {
    "@babel/core": "^7.9.6",
    "@babel/node": "^7.8.7",
    "@babel/preset-env": "^7.9.6",
    "body-parser": "^1.19.0",
    "cookie-parser": "^1.4.5",
    "core-js": "^3.6.5",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "helmet": "^3.22.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.9.15",
    "morgan": "^1.10.0",
    "passport": "^0.4.1",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^6.0.1",
    "validator": "^13.0.0"
}
```
#### 실행
```
$ nohup npm start &
```

## **TODO List** 📝
### [✔] Sing UP
#### 📎 API 통신 예제
- **[POST]** '/join'
- Request
```js
// body
{
    "email": "dlfdyd96@gmail.com", // 아이디
    "password": "zz",
    "passwordConfirmation": "zz",
    "name" : "일용"
}
```
- Response
```js
// 회원가입 후 바로 로그인됨 -> Token Return
// status : 200 OK
data : {
    "name": "일용",
    "token": "eyJhbGciOiJIUzI..." // token 정보 -> sessionStorage에 저장할 것
}
```
- [✔] 아이디 : Email로 변경해야함.
- [+] 이메일 확인 과정 필요
- [+] 성향과 묶어야함.
---
### [✔] Login
#### 📎 API 통신 예제
- **[POST]** '/login'
- Request
```js
// body
{
    "email" : "dlfdyd96@gmail.com",
    "password": "zz"
}
```
- Response
```js
// status : 200 OK
{
    "user": {
        "_id": "5ecbb09ee0c5c359f7a28cfd",
        "email": "ee@naver.com",
        "name": "일용",
        "_selection": []
    },
    "token": "eyJhbGciOiJIUzI1NiJ9.ZWVAbmF2ZXIuY29t.fxkUFWxI6kEkKVYebtiOPuLV8T0bzWlF6iw4y-dgYWc"
}

// status : 400 Bad Request
{
    "message": "Check the account",
    "user": false
}
```
#### ⚙ 동작
`passport-local-mongoose` 를 사용하여 local Login 구현
```js
// passport.js
passport.use(User.createStrategy()) // 로 passport-local 쓰지 않고 간단하게 로그인 구현 가능
```
```js
// ./models/User.js
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'}); // passportLocalMongoose를 plugin 해준다.
// email로 로그인하기때문에 usernameField 설정 필수.
```
- [+] 카카오 아이디로 로그인.
- [+] 네이버 아이디로 로그인.
---
### ~~[✔] Session~~
---
### [✔] JWT
`passport-jwt`, `passport`, `jsonwebtoken` 사용
- 참고 사이트 : [passport.org](http://www.passportjs.org/packages/passport-jwt/), [Learn Using JWT with Passport Authentication](https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314)
#### ⚙ 동작
```js
// passport.js

// JWT Token Authentication
passport.use(
    new passportJWT.Strategy({
            // options
            jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), 
            secretOrKey   : 'thisIsMySecret'
        },
        // callback
        function (jwtPayload, cb) {
            console.log(jwtPayload);
            //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
            return User.findOneById(jwtPayload.id)
                .then(user => {
                    return cb(null, user);
                })
                .catch(err => {
                    return cb(err);
                });
        }
    )
)
```
```js
// globalRouter

globalRouter.post(routes.login, postLoin);
```
```js
// UserController.js

export const postLoin = (req, res, next) => {
    passport.authenticate('local', {session: false}, 
        (err, user, info) => {
            if(err) console.log(err);
            if (err || !user) {
                return res.status(400).json({
                    message: 'Check the account',
                    user   : user
                });
            }
            req.login(user, {session: false}, (err) => {
                if (err) {
                    res.send(err);
                }
                // generate a signed son web token with the contents of user object and return it in the response
                const token = jwt.sign(user.email, 'thisIsMySecret');
                return res.json({name : user.name, token});
            });
        }
    )(req, res);
}
```
- [+] Secret 키는 배포전에 process.env.JWT_SECRET 로 숨기기
---
### [✔] Naver Server에 올리기
#### 🗄 Server
- `VSCode Remote - WSL` 을 통해 서버의 코드들을 vscode에서 작성 가능 하도록 했음.
- 도메인 주소 : http://49.50.175.145:3389/
---
### ~~[❌] HTTPS~~
- https 인증서 발행
  - [참고사이트](http://blog.naver.com/PostView.nhn?blogId=awesomedev&logNo=220713833207)
- OAuth에 필요
---
### [✔] 초기 Selections 추가
#### 📎 API 통신 예제
- **[POST]** '/user/select-tendency'
- Request
``` js
// body
{
    "selection" : ["경북궁", "해운대"]
}

// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
```
- Response
```js
{
    "message": "Success Update Tedency",
    "selection": [
        "경북궁",
        "해운대"
    ]
}
```
#### ⚙ 동작
- Router
```js
userRouter.post(routes.selectTendency, 
    passport.authenticate('jwt', { session: false}), // 인증 Middleware
    postTendency)   // 경향 등록
```
- Controller
```js
// 성향 파악 질문
export const postTendency = async (req, res, next) => {
    const { body : { selection }  } = req;
    try {
        await User.findOneAndUpdate( { _id: req.user._id },
            { selection }
        )
        res.status(200).json({
            message: 'Success Update Tedency',
            selection   : selection
        })
    } catch(err) {
        console.log(`Error with Post Tedency : ${err}`)
        res.status(400).json({
            message: 'Fail to update Tedency',
            selection   : selection
        })
    }
}
```
---
### [✔] Edit Profile
#### 📎 API 통신 예제
- **[POST]** '/user/edit-profile'
- Request
``` js
// body
{
    "name" : "일용"
    // Avartar 나 다른 것들 나중에 추가할 것.
}

// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함

```
- Response
```js
{
    message: 'Sucess to Update Profile'
}
```

#### ⚙ 동작
```js
await User.findOneAndUpdate(
        { _id: req.user._id },
        { ...body }
      );
```
---
### [✔] Change Password
#### 📎 API 통신 예제
- **[POST]** '/user-password'
- Request
``` js
// body
{
    oldPassword : 'aa', 
    newPassword : 'zzz', 
    newPassword2 : 'zzz'
}

// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함

```
- Response
```js
{
    message: 'Sucess to Change Password'
}
```
#### ⚙ 동작
---
### [✔] 여행일정 C/R/U/D
#### 📎 API 통신 예제
1. Create
    - **[POST]** '/itinerary/upload'
    - Request
    ```js
    // body
    {
        "title" : "대구 동성로 여행",
        "description" : "장마때 대구 여행 갔다 ^^",
        "date":"6월 13일",
        "routes" : [
            1871383, 
            2599899, 
            998882,
            1608882
            ]
    }

    // header
    Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
    ```
    - Response
    ```js
    // Success(200)
    {
        "message": "Success Upload Itinerary",
        "init": {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                1871383,
                2599899,
                998882,
                1608882
            ],
            "publish": false,
            "_id": "5ee3b5059b9e1a304c6a4e96",
            "creator": "5ee0c4c9bdc5487b2c41f1fa",
            "title": "대구 동성로 여행",
            "date": "6월 13일",
            "description": "장마때 대구 여행 갔다 ^^",
            "createdAt": "2020-06-12T17:01:57.910Z",
            "__v": 0
        }
    }
    // Fail(400)
    ```
2. Read
    - **[GET]** '/itinerary/${itinerary id값}'
    - Request
    ```js
    // None
    ```
    - Response
    ```js
    // Success(200)
    {
        "message": "Success Get Itinerary",
        "itinerary": {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                126028,
                126078,
                126830,
                132188
            ],
            "publish": true,
            "_id": "5ee0d662ecae9054b880f5d8",
            "creator": {
                "selections": null,
                "_id": "5ee0c4c9bdc5487b2c41f1fa",
                "email": "1dydtestze",
                "name": "잉용잉용",
                "createdAt": "2020-06-10T11:32:25.636Z",
                "__v": 0
            },
            "title": "부산 여행(real)",
            "date": "4월 3일",
            "description": "부산 여행 갔다 ^^",
            "createdAt": "2020-06-10T12:47:30.636Z",
            "__v": 0
        },
        "routes": [
            // 자세한 내용을 알고 싶다면 밑에서 "Routes 내용" 펼쳐보기
        ]
    }

    // Fail(400)
    ```
<details>
<summary>routes 내용</summary>

```js
    "routes": [
        {
            "readCount": 39300,
            "contentId": 126028,
            "contentTypeId": 12,
            "areaCode": 6,
            "sigunguCode": 2,
            "cat1": "A01",
            "cat2": "A0101",
            "cat3": "A01010400",
            "mapX": "129.0518587773",
            "mapY": "35.2684489780",
            "mLevel": "6",
            "title": "금정산 (부산 국가지질공원)",
            "firstImage": "http://tong.visitkorea.or.kr/cms/resource/45/1605345_image2_1.jpg",
            "firstImage2": "http://tong.visitkorea.or.kr/cms/resource/45/1605345_image3_1.jpg",
            "homepage": "부산국가지질공원 <a href=\"http://www.busan.go.kr/geopark/index\"target=\"_blank\"title=\"새창:부산국가지질공원\">http://www.busan.go.kr/geopark/index</a>",
            "overview": "약 7천만 년 전 지하에서 마그마가 식어서 생성된 화강암이 융기하여 형성된 부산 땅의 뿌리를 이루는 산이다.오랜 세월 비바람에 깎이고 다듬어져 만들어진 기암절벽, 토르, 나마, 인셀베르그, 블록스트림 등의 우아한 화강암 지형을 감상할 수 있다.범어사, 금정산성 등의 부산의 역사유적과 다양한 산악식물을 감상할 수 있으며, 탐방 중 산정상에서 마실 수 있는 시원한 산성막걸리도 일품이다.<br /><br /><출처 : 부산국가지질공원><br>",
            "tel": "Empty",
            "addr1": "",
            "addr2": "Empty",
            "zipCode": "부산광역시 금정구 금성동"
        },
        {
            "readCount": 99489,
            "contentId": 126078,
            "contentTypeId": 12,
            "areaCode": 6,
            "sigunguCode": 12,
            "cat1": "A01",
            "cat2": "A0101",
            "cat3": "A01011200",
            "mapX": "129.1184922375",
            "mapY": "35.1537908369",
            "mLevel": "6",
            "title": "광안리해수욕장",
            "firstImage": "http://tong.visitkorea.or.kr/cms/resource/78/2648978_image2_1.jpg",
            "firstImage2": "http://tong.visitkorea.or.kr/cms/resource/78/2648978_image3_1.jpg",
            "homepage": "<a href=\"http://www.suyeong.go.kr/tour/index.suyeong?menuCd=DOM_000001102001001000&link=success&cpath=%2Ftour\" target=\"_blank\" title=\"새창 : 광안리해수욕장 사이트로 이동\">http://www.suyeong.go.kr</a>",
            "overview": "광안리해수욕장은 부산광역시 수영구 광안2동에 있으며 해운대 해수욕장의 서쪽에 위치하고 있다. 총면적 82,000㎡, 길이 1.4km, 사장폭은 25~110m의 질 좋은 모래사장이 있고, 지속적인 수질 정화를 실시하여 인근의 수영강에 다시 고기가 살 수 있을 정도로 깨끗한 수질을 자랑하며, 특히 젊은이들이 즐겨 찾는 명소이다. 광안리에서는 해수욕뿐 아니라 독특한 분위기를 자아내는 레스토랑, 카페 등과 시내 중심가 못지않은 유명 패션상가들이 즐비하며, 다양한 먹을거리, 볼거리가 있어서 피서의 즐거움을 더해준다. 특히 밤이 되면 광안대교의 아름다운 야경이 장관이다.<br><br>해수욕장 주변에는 낭만이 깃든 카페거리와 300여 곳의 횟집이 있고 야외무대가 설치되어 있어서 부산 바다축제를 비롯한 다양한 축제가 개최되고 있으며, 해변을 찾는 피서객을 위한 공연도 있다. 인근의 수영강에서는 낚시를 할 수도 있고, 싱싱한 회를 즉석에서 맛볼 수도 있으며 올림픽 요트 경기장이 있어서 요트를 탈 수도 있다. 숙박시설도 잘 갖추어져 있다. 해변과 인접해 있는 호텔을 이용해도 되고 알뜰한 피서를 원한다면 인근 금련산에 소재한 청소년수련원를 이용하면 된다. 이곳에는 텐트 설치가 가능하며 숙박동도 대여해 주고 취사시설도 완비되어 있다. 해수욕장 인근에는 다양한 문화시설들이 있는데 남천해변의 자유바다를 비롯하여 KBS, MBC 방송국이 있으며, MBC 내에는 개봉관인 시네마홀 극장도 있다. 피서철에는 다양한 축제가 열리므로 피서객들에게 즐길 수 있는 문화공간도 제공한다.<br /><br />광안리해변에는 100여 개의 카페가 있다. 음악과 칵테일과 낭만이 깃든 카페에서 바라보는 해수욕장과 광안대교는 아름답기 그지없다. 광안대교에서 이곳을 바라보면 마치 동화 속 유럽의 한 도시를 여행하고 있는 듯한 착각을 할 만큼 예쁘게 꾸며져 있다. 광안리 해수욕장과 인접해 있어 가족단위나 친구·연인과의 만남을 위한 장소이기도 하다. 또한 이곳에서는 음식과 술뿐만 아니라 야외음악도 감상할 수 있다.",
            "tel": "Empty",
            "addr1": "",
            "addr2": "Empty",
            "zipCode": "부산광역시 수영구 광안해변로 219"
        },
        {
            "readCount": 24894,
            "contentId": 126830,
            "contentTypeId": 12,
            "areaCode": 6,
            "sigunguCode": 5,
            "cat1": "A02",
            "cat2": "A0202",
            "cat3": "A02020700",
            "mapX": "129.0611254938",
            "mapY": "35.1359084454",
            "mLevel": "6",
            "title": "자성대공원",
            "firstImage": "http://tong.visitkorea.or.kr/cms/resource/53/2445453_image2_1.jpg",
            "firstImage2": "http://tong.visitkorea.or.kr/cms/resource/53/2445453_image3_1.jpg",
            "homepage": "<a href=\"http://tour.bsdonggu.go.kr/\" target=\"_blank\" title=\"부산 동구 문화관광 사이트로 이동\">http://tour.bsdonggu.go.kr</a>",
            "overview": "* 부산진성에 위치한 자성대공원*<br /><br />부산 동구 범일동에는 지방기념물 제7호인 부산진성이 있다. 흔히 자성대로 부르는 부산진성은 임진왜란 때 왜적이 부산성을 헐고 성의 동남부에 일본식의 성을 쌓아 지휘소로 이용한 곳이다. 왜적이 물러간 뒤에는 명나라의 만세덕군이 진주한 일이 있어 만공대라고도 했었다. 임진왜란 뒤에 다시 수축되어 좌도수군첨절제사의 진영으로 활용되었다. 기록에 의하면 동서의 산을 따라 성벽으로 성곽을 두르고 바닷물을 끌여들여 참호를 20m쯤의 넓이로 만들어 배가 바로 성벽에 닿도록 되어 있었다고 한다. 이 성의 현재 모습은 1974년 7월 8일부터 1975년 2월 25일까지 부산시에서 정화 복원공사를 하여 동문, 서문, 장대를 신축하여 동문을 진동문, 서문을 금루관, 자성대 위의 장대를 진남대라 각각 명명하여 그 편액을 달았다. 이 당시 정화공사로 신축된 건춘문, 금루관, 진남대와 함께 임진왜란 때 왜적이 쌓은 2단의 일본식 성벽이 남아 있다. 그리고 1975년 9월 동문주변 성곽을 신축하였으며 지금 서문의 금루관은 높다란 다락이 되어 우뚝 서 있고 문의 왼쪽에는 남요인후라 새긴 돌기둥이 서 있으며, 문의 오른쪽에는 서문쇄약이라 새긴 돌기둥이 서 있다.<br>",
            "tel": "Empty",
            "addr1": "",
            "addr2": "Empty",
            "zipCode": "부산광역시 동구 자성로 99"
        },
        {
            "readCount": 22488,
            "contentId": 132188,
            "contentTypeId": 38,
            "areaCode": 6,
            "sigunguCode": 7,
            "cat1": "A04",
            "cat2": "A0401",
            "cat3": "A04010200",
            "mapX": "129.0614025211",
            "mapY": "35.1624610334",
            "mLevel": "6",
            "title": "부산 부전시장",
            "firstImage": "http://tong.visitkorea.or.kr/cms/resource/23/1960423_image2_1.jpg",
            "firstImage2": "http://tong.visitkorea.or.kr/cms/resource/23/1960423_image3_1.jpg",
            "homepage": "<a href=\"http://www.bjmarket.kr/\" target=\"_blank\" title=\"부전시장 홈페이지로 이동\">http://www.bjmarket.kr</a>",
            "overview": "부전시장(부전상가)는 \n부산에서 규모가 부산 제 1의 재래시장이다. 각종 농, 수, 축산물 및 생활용품 등의 도 소매상으로 형성되어 있다. 신선한 채소와 과일서부터 생선, \n건어물, 가공식품, 밑반찬까지 다양한 먹을거리, 살 거리가 풍성하다. 이 외에도 그릇, 침구류, 의류 등 없는 것이 없다고 말할 수 있을 만큼 \n갖가지 상품들이 즐비해 있다. <br /><br />부전동 지하철역과 가까운 곳에 위치한 부전시장은  신선한\n 채소, 싱싱한 생선, 건어물, 가공식품, 과일, 회, 닭고기, 밑반찬, 건강식품, 그릇, 침구류,\n 의류 등 없는 것이 없을 만큼 풍성한 물량을 보유하고 있다. 부전시장 안 에서도 인삼시장은\n 부산 제 1의 규모를 자랑하는 시장으로 가격면에서도 시중시세의 20-30%이상 싸고 온갖 종류\n 의 인삼과 건강보조식품을 살 수있다. 또한 부전시장 주변에는 전자도매상가가 밀집 해 있는\n 데, 시중에서의 가격보다 20∼30%정도싸다.<br /><br /> 한약재료상가와 인삼전문시장도 특히 유명하다. 부전시장의 \n묘미를 제대로 느끼려면 새벽에 찾아가보자. 농산물 새벽시장이 열리는 현장은 삶의 활력을 느낄 수 있다. 해가 채 뜨기도 전인 어스름 새벽부터 \n바삐 움직이는 상인들의 모습을 보면서 땀방울이 만들어내는 활기찬 삶의 냄새를 맡을 수 있을 것이다.<br>",
            "tel": "051-818-1091",
            "addr1": "부산 부전시장상인회",
            "addr2": "부산광역시 부산진구 중앙대로755번길 21",
            "zipCode": "(부전동)"
        }
    ]
```

</details>

3. Update
    - **[POST]** '/itinerary/${itinerary id 값}/edit'
    - Request
    ```js
    // body (수정할 것 만 넣으면 됨)
    {
        "title" : "부산 여행",
        "description" : "부산 여행 갔다 ^^ (수정)",
        "date" : "1월 2일",
        "routes" : [ 126438 ]
    }

    // header
    Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
    ```
    - Response
    ```js
    // Success(200)
    {
        "message": "Success Update Itinerary"
    }

    // Fail(400)
    ```
4. Delete
    - **[GET]** '/itinerary/${itinerary id 값}/delete'
    - Request
    ```js
    // header
    Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
    ```
    - Response
    ```js
    // Success(200)
    {
        "message": "Success To Delete itinerary"
    }

    // Fail(400)
    {
        "message": "Failed to Delete Itinerary",
        "error": {}
    }
    ```
#### ⚙ 동작
- Itineary Model 만들기
- User Model에 ref 연결
```js
import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "Creator is required"
    },
    //....
})

const model = mongoose.model('Itinerary', itinerarySchema);

export default model;

```
---
### [✔] My Page
#### 📎 API 통신 예제
- **[GET]** '/user/${사용자 id 값}'
- Request
```js
// None
```
- Response
```js
{
    "message": "Success get User Detail",
    "user": {
        "selections": null,
        "_id": "5ee0c4c9bdc5487b2c41f1fa",
        "email": "1dydtestze",
        "name": "잉용잉용",
        "createdAt": "2020-06-10T11:32:25.636Z",
        "__v": 0
    },
    "itinerary": [
        {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                125452,
                128022,
                126008
            ],
            "publish": false,
            "_id": "5ee0c6d484e86b68e4fab6e1",
            "creator": "5ee0c4c9bdc5487b2c41f1fa",
            "title": "부산 여행",
            "date": "4월 3일",
            "description": "부산 여행 갔다 ^^",
            "createdAt": "2020-06-10T11:41:08.803Z",
            "__v": 0
        },
        {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                125452,
                128022,
                126008
            ],
            "publish": false,
            "_id": "5ee0c6e284e86b68e4fab6e2",
            "creator": "5ee0c4c9bdc5487b2c41f1fa",
            "title": "부산 여행",
            "date": "4월 3일",
            "description": "부산 여행 갔다 ^^",
            "createdAt": "2020-06-10T11:41:22.232Z",
            "__v": 0
        },
        {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                126028,
                126078,
                126830,
                132188
            ],
            "publish": true,
            "_id": "5ee0d662ecae9054b880f5d8",
            "creator": "5ee0c4c9bdc5487b2c41f1fa",
            "title": "부산 여행(real)",
            "date": "4월 3일",
            "description": "부산 여행 갔다 ^^",
            "createdAt": "2020-06-10T12:47:30.636Z",
            "__v": 0
        }
    ]
}
```
#### ⚙ 동작
~~생략~~

---
### [✔] Content 얻기
#### 📎 API 통신 예제
- **[GET]** '/content/${location ID}'
  - ex) location ID : 12542 (여수역)
- Request
```js
// None
```
- Response
```js
{
    "message": "Success Get Content Detail",
    "content": {
        "_id": "5ee0c6f684e86b68e4fab6e3",
        "content": 123,
        "createdAt": "2020-06-10T11:41:42.802Z",
        "__v": 0
    },
    "comments": [
        {
            "_id": "5ee3b19a9b9e1a304c6a4e95",
            "comment": "할많하않1",
            "author": {
                "selections": null,
                "_id": "5ee0c4c9bdc5487b2c41f1fa",
                "email": "1dydtestze",
                "name": "잉용잉용",
                "createdAt": "2020-06-10T11:32:25.636Z",
                "__v": 0
            },
            "content": "5ee0c6f684e86b68e4fab6e3",
            "createdAt": "2020-06-12T16:47:22.556Z",
            "__v": 0
        },
        {
            "_id": "5ee0c72b84e86b68e4fab6e5",
            "comment": "할많하않1",
            "author": {
                "selections": null,
                "_id": "5ee0c4c9bdc5487b2c41f1fa",
                "email": "1dydtestze",
                "name": "잉용잉용",
                "createdAt": "2020-06-10T11:32:25.636Z",
                "__v": 0
            },
            "content": "5ee0c6f684e86b68e4fab6e3",
            "createdAt": "2020-06-10T11:42:35.207Z",
            "__v": 0
        }
    ]
}
```
---
### [✔] Create Comment 
#### 📎 API 통신 예제
- **[POST]** '/content/${content ID}/comment'
  - ex) content ID는 위의 Content ID를 클릭 할 경우 생성된 content 고유의 ID
  - response 의 content._id 를 참조해야함.
- Request
```js
// body (수정할 것 만 넣으면 됨)
{
    "text" : "할말은 많지만 하지 않겠다..."
}

// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
```
- Response
```js
{
    "msg": "Success Post Comment",
    "comment": {
        "_id": "5ee3b19a9b9e1a304c6a4e95",
        "comment": "할많하않1",
        "author": "5ee0c4c9bdc5487b2c41f1fa",
        "content": "5ee0c6f684e86b68e4fab6e3",
        "createdAt": "2020-06-12T16:47:22.556Z",
        "__v": 0
    }
}
```
---
### [✔] Delete Comment
#### 📎 API 통신 예제
- **[GET]** '/api/comment/${comment id 값}/delete'
  - comment 고유의 _id 값임
- Request
```js
// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
```
- Response
```js
{
    "message": "Success To Delete Comment"
}
```
---
### [✔] Itinerary 공유 
#### 📎 API 통신 예제
- **[GET]** '/itinerary/${여행 일정 id}/public'
- Request
```js
// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
```
- Response
```js
{
    "message": "Success to set public",
    "item": {
        "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
        "routes": [
            126028,
            126078,
            126830,
            132188
        ],
        "publish": true,
        "_id": "5ee0d662ecae9054b880f5d8",
        "creator": "5ee0c4c9bdc5487b2c41f1fa",
        "title": "부산 여행(real)",
        "date": "4월 3일",
        "description": "부산 여행 갔다 ^^",
        "createdAt": "2020-06-10T12:47:30.636Z",
        "__v": 0
    }
}
```
---
### [✔] Itinerary 공유 해제
#### 📎 API 통신 예제
- **[GET]** '/itinerary/${여행 일정 id}/private'
- Request
```js
// header
Authorization : `Bearer ${sessionStorage.getItem('token')}` // 꼭 'Bearer ' 붙여줘야함
```
- Response
```js
// 위 응답과 동일하고 
// ...
    "publish" : false // 이부분만 다름
// ...

```
---
### [✔] Share Page 
#### 📎 API 통신 예제
- **[GET]** '/itinerary/'
- Request
```js
// None
```
- Response
```js
{
    "message": "Success to get Itineraries",
    "items": [
        {
            "img": "http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg",
            "routes": [
                126028,
                126078,
                126830,
                132188
            ],
            "publish": true,
            "_id": "5ee0d662ecae9054b880f5d8",
            "creator": {
                "selections": null,
                "_id": "5ee0c4c9bdc5487b2c41f1fa",
                "email": "1dydtestze",
                "name": "잉용잉용",
                "createdAt": "2020-06-10T11:32:25.636Z",
                "__v": 0
            },
            "title": "부산 여행(real)",
            "date": "4월 3일",
            "description": "부산 여행 갔다 ^^",
            "createdAt": "2020-06-10T12:47:30.636Z",
            "__v": 0
        }
    ]
}
```
---
### [❌] 이메일 인증 하기
- [ ] 언제 하누?
---
### [❌] 카카오 아이디로 로그인
- [ ] Front 가 편안할 때 하기 (ㅋㅋ)