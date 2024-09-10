import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/* 사용자 회원가입 API */
router.post('/sign-up', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const isExistUser = await prisma.users.findFirst({
            where: {
                email,
            },
        });

        if (isExistUser) {
            return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
        }

        // 사용자 비밀번호를 암호화합니다.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Users 테이블에 사용자를 추가합니다.
        const user = await prisma.users.create({
            data: {
                email,
                password: hashedPassword, // 암호화된 비밀번호를 저장합니다.
            },
        });

        return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (err) {
        next(err);
    }
});

/* 로그인 API */
router.post('/sign-in', async (req, res, next) => {
    const { email, password } = req.body;

    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
        return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
    }
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    const token = jwt.sign({ userId: user.userId }, 'custom-secret-key');

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

/* 캐릭터 생성 API */
router.post('/characters/create', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const { characterName } = req.body;

    const isExistName = await prisma.characters.findFirst({ where: { characterName: characterName } });
    if (isExistName) return res.status(401).json({ message: '이미 존재하는 캐릭터이름 입니다.' });

    const character = await prisma.characters.create({
        data: {
            userId: +userId,
            characterName: characterName,
        },
    });

    return res.status(200).json({ data: character });
});

/* 캐릭터 삭제 API */
router.delete('/characters/delete/:characterId', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const { characterId } = req.params;

    const isCharacter = await prisma.characters.findFirst({ where: { userId: +userId, characterId: +characterId } });

    if (!isCharacter) return res.status(401).json({ message: '캐릭터가 존재하지 않습니다.' });

    const character = await prisma.characters.delete({
        where: { userId: +userId, characterId: +characterId },
    });

    return res.status(200).json({ data: character });
});

/* 캐릭터 조회 / 상세조회 API */
router.get('/characters/:characterId', authMiddleware, async (req, res, next) => {
    const { characterId } = req.params;
    const { userId } = req.user;
    const isCharacter = await prisma.characters.findFirst({ where: { characterId: +characterId } });
    if (isCharacter.userId === userId) {
        const data = await prisma.characters.findFirst({
            where: { characterId: +characterId },
            select: {
                characterName: true,
                health: true,
                power: true,
                money: true,
            },
        });

        return res.status(200).json({data : data});
    }
    else{
        const data = await prisma.characters.findFirst({
            where: { characterId: +characterId },
            select: {
                characterName: true,
                health: true,
                power: true
            },
        });

        return res.status(200).json({data : data});
    }
});

/* 아이템 생성 API */
router.post('/item/create', async (req, res, next) => {
    const { name, health, power, price } = req.body;

    const isExistName = await prisma.items.findFirst({ where: { name: name } });
    if (isExistName) return res.status(401).json({ message: '이미 존재하는 아이템이름 입니다.' });

    const item = await prisma.items.create({
        data: {
            name: name,
            health : health,
            power : power,
            price : price
        },
    });

    return res.status(200).json({ data: item });
});

/* 아이템 수정 API */
router.patch('/item/create/:itemId', async (req, res, next) => {
    const { name, health, power} = req.body;
    const {itemId} = req.params;

    const item = await prisma.items.update({
        where : {itemId : +itemId},
        data: {
            name: name,
            health : health,
            power : power,
        },
    });

    return res.status(200).json({ data: item });
});

/* 아이템 테이블 조회 API */
router.get('/item', async (req, res, next) => {
    const data = await prisma.items.findMany({
        select:{
            itemId : true,
            name : true,
            price : true
        }
    })

    return res.status(200).json({ data: data });
});

/* 아이템 상세 조회 API */
router.get('/item/:itemId', async (req, res, next) => {
    const {itemId} = req.params;

    const data = await prisma.items.findFirst({
        where : {itemId : +itemId},
        select:{
            itemId : true,
            name : true,
            health : true,
            power : true,
            price : true
        }
    })

    return res.status(200).json({ data: data });
});

/* 아이템 구매 API */
router.post('/characters/store/:characterId', authMiddleware, async (req, res, next) =>{
    const list = req.body;
    const {userId} = req.user;
    let sum = 0;
    const {characterId} = req.params;
    for(let i = 0 ; i < list.length ; i++){
        const itemId = list[i].itemId;
        const cost = await prisma.items.findFirst({
            where : {itemId : +itemId},
            select :{ price : true}
        })
        sum += list[i].count * cost.price;
    }
    console.log("buying cost : " + sum);
    const having = await prisma.characters.findFirst({
        where : {characterId : +characterId},
        select :{ money : true}
    })

    if(having.money < sum) return res.status(409).json({message : "소지금이 부족합니다."});
    else{
        const buyItem = await prisma.characters.update({
            where : {characterId : +characterId},
            data : {money : having.money - sum}
        })
    }

    return res.status(200).json({data : sum});
});

/*
router.get('/users', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const user = await prisma.users.findFirst({
        where: { userId: +userId },
        select: {
            userId: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            userInfos: {
                select: {
                    name: true,
                    age: true,
                    gender: true,
                    profileImage: true,
                },
            },
        },
    });

    return res.status(200).json({ data: user });
});
*/
export default router;
