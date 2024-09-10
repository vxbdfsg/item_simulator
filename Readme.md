#09-10 작업내용

##1. 데이터베이스 생성


###Users 테이블

userId - 유저의 아이디 / default : autoIncrement
email - 유저의 로그인용 이메일
password = 유저의 로그인용 비밀번호


###Characters 테이블

characterId - 캐릭터의 아이디 / default : autoIncrement
userId - 유저 테이블에서 받아온 유저의 아이디
characterName  - 케릭터의 이름
createdAt  - 캐릭터의 생성일시 default : DateNow
health  - 캐릭터의 체력 / default : 500
power  - 캐릭터의 공격력 / default : 100
money - 캐릭터의 소지금 / default : 10000


###items 테이블

itemId - 아이템의 아이디 / default : autoIncrement
name - 아이템의 이름
health - 아이템의 체력 상승량 / default : 10
power - 아이템의 공격력 상승량 / default : 1


###inventory 테이블

characterId - 소지한 캐릭터의 아이디
itemId - 소지한 아이템의 아이디
count - 소지한 아이템의 갯수


###equipments 테이블

characterId - 장착한 캐릭터의 아이디
itemId - 장착한 아이템의 아이디


##2.필수 과제 API 생성 
(기본 주소는 '/api')


###사용자 회원가입 API 
- 이메일과 패스워드를 받아 비밀번호를 암호화해 저장 / 중복된 이메일이 들어오면 에러 반환
router.post('/sign-up')

###로그인 API 
- 이메일과 패스워드를 받아 jwt로 검사후 로그인
router.post('/sign-in')

###캐릭터 생성 API 
- 유저의 아이디와 캐릭터의 이름을 받아 위의 데이터베이스대로 캐릭터를 생성
router.post('/create/Character')

###캐릭터 삭제 API 
- 유저의 아이디와 캐릭터의 아이디를 받아 해당하는 캐릭터를 삭제 / 캐릭터가 존재하지 않을 시 에러 반환
router.delete('/delete/Character/:characterId')

###캐릭터 조회 / 상세조회 API 
- 캐릭터의 아이디를 파라미터로 입력받아 캐릭터의 정보 출력
단, 캐릭터가 본인소유의 캐릭터일경우 소지금까지 출력. 그 이외에는 이름 체력 공격력만 출력
router.get('/characters/:characterId')

###아이템 생성 API 
- 아이템을 생성하고 입력받지 않은 데이터는 디폴트값으로 생성
router.post('/item/create')

###아이템 수정 API 
- 아이템의 수정사항을 입력하고 반영. 단, 아이템의 가격은 변경할 수 없음
router.patch('/item/create/:itemId')

###아이템 테이블 조회 API 
- 모든 아이템의 ID, 이름, 가격을 표시
router.get('/item')

###아이템 상세 조회 API 
- 파라미터로 입력받은 아이템의 상세 정보를 표시
router.get('/item/:itemId')


##3.도전 과제 API 생성 

###아이템 구매 API
- body에서 전달받은 아이템의 코드를 이용해 가격의 합계를 구하고 소지금과 합계를 비교해 서로 다른 메세지를 반환
router.post('/characters/store/:characterId')



#09-11 작업내용

##3.도전 과제 API 생성