import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const getModel = (endpoint: string) => {
  const modelMap: { [key: string]: any } = {
    categories: prisma.categorie,
    marques: prisma.marque,
    modeles: prisma.modele,
    fournisseurs: prisma.fournisseur,
    emplacements: prisma.emplacement,
    partenaires: prisma.partenaire,
    projets: prisma.projet,
    utilisateurs: prisma.utilisateur,
  };
  return modelMap[endpoint];
};

const schemas: { [key: string]: z.ZodType<any> } = {
  categories: z.object({ nom: z.string().min(1) }),
  marques: z.object({ nom: z.string().min(1) }),
  modeles: z.object({ nom: z.string().min(1), marqueId: z.string().uuid(), categorieId: z.string().uuid() }),
  fournisseurs: z.object({ nom: z.string().min(1) }),
  emplacements: z.object({ nom: z.string().min(1) }),
  partenaires: z.object({ nom: z.string().min(1), contactNom: z.string().min(1), email: z.string().email(), telephone1: z.string().min(1), telephone2: z.string().optional().nullable() }),
  projets: z.object({ nom: z.string().min(1), partenaireId: z.string().uuid(), description: z.string().optional() }),
  utilisateurs: z.object({ nom: z.string().min(1), username: z.string().min(1), email: z.string().email(), password: z.string().min(8), role: z.enum(['admin', 'marketing', 'technician']) }),
};

export async function GET(
  req: Request,
  context: { params?: { endpoint?: string[] } }
) {
  try {
    const endpointSegments = context?.params?.endpoint ?? [];

    // If no endpoint is provided, return all settings
    if (endpointSegments.length === 0) {
      const [categories, marques, modeles, fournisseurs, emplacements, partenaires, projets, utilisateurs, mailConfig] = await Promise.all([
        prisma.categorie.findMany({ orderBy: { nom: 'asc' } }),
        prisma.marque.findMany({ orderBy: { nom: 'asc' } }),
        prisma.modele.findMany({ 
          include: { marque: true, categorie: true }, 
          orderBy: { nom: 'asc' } 
        }),
        prisma.fournisseur.findMany({ orderBy: { nom: 'asc' } }),
        prisma.emplacement.findMany({ orderBy: { nom: 'asc' } }),
        prisma.partenaire.findMany({ orderBy: { nom: 'asc' } }),
        prisma.projet.findMany({ 
          include: { partenaire: true }, 
          orderBy: { nom: 'asc' } 
        }),
        prisma.utilisateur.findMany({ 
          orderBy: { nom: 'asc' },
          select: {
            id: true,
            username: true,
            email: true,
            nom: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.mailConfig.findFirst(),
      ]);
      return NextResponse.json({ 
        categories, 
        marques, 
        modeles, 
        fournisseurs, 
        emplacements, 
        partenaires, 
        projets, 
        utilisateurs, 
        mailConfig 
      });
    }

    const endpoint = endpointSegments[0];
    const model = getModel(endpoint);

    if (!model) {
      return new NextResponse('Endpoint not found', { status: 404 });
    }

    const items = await model.findMany();
    return NextResponse.json(items);
  } catch (error) {
    console.error(`[API_SETTINGS_GET_ERROR]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params?: { endpoint?: string[] } }
) {
  try {
    const endpointSegments = context?.params?.endpoint ?? [];

    if (endpointSegments.length === 0) {
      return new NextResponse('Endpoint is required', { status: 400 });
    }

    const endpoint = endpointSegments[0];

    if (endpoint === 'mail') {
      const body = await req.json();
      const { id, smtpPass, ...dataToUpdate } = body;

      // For now, we assume a single config record.
      let config = await prisma.mailConfig.findFirst();

      if (config) {
        await prisma.mailConfig.update({
          where: { id: config.id },
          data: dataToUpdate,
        });
      } else {
        await prisma.mailConfig.create({
          data: {
            ...dataToUpdate,
            notificationEmails: dataToUpdate.notificationEmails || []
          },
        });
      }
      return NextResponse.json({ message: 'Configuration saved' }, { status: 200 });
    }

    const model = getModel(endpoint);
    if (!model) {
      return new NextResponse('Endpoint not found', { status: 404 });
    }

    const schema = schemas[endpoint];
    if (!schema) {
      return new NextResponse('Invalid endpoint', { status: 400 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    if (endpoint === 'utilisateurs') {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = await model.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      const { password, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    }

    const newItem = await model.create({ data });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(`[API_SETTINGS_POST_ERROR]`, error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params?: { endpoint?: string[] } }
) {
  try {
    const endpointSegments = context?.params?.endpoint ?? [];

    if (endpointSegments.length < 2) {
      return new NextResponse('Endpoint and ID are required', { status: 400 });
    }

    const [endpoint, id] = endpointSegments;

    const model = getModel(endpoint);
    if (!model) {
      return new NextResponse('Endpoint not found', { status: 404 });
    }

    await model.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API_SETTINGS_DELETE_ERROR]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}