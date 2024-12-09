import { Request, Response } from "express";
import { ArtifactModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";
interface RequestBody {
  eventCode: string;
  imageName: string;
  data: Array<{
    cveId: string;
    description: string;
    severity: string;
    score?: number;
  }>;
}
export async function importVulnToImage(req: Request, res: Response) {
  const { eventCode, imageName, data }: RequestBody = req.body;
  try {
    // imageName is either in format of {image}:{tag} or {author}/{image}:{tag}. Retrieve the image and tag from it
    const name = imageName.split(":")[0];
    const version = imageName.split(":")[1];
    const type = "image";
    const artifacts = await ArtifactModel.find({
      name,
      version,
    });

    console.log(artifacts);

    if (!artifacts) {
      return res.json(
        errorResponse(
          `No artifact found with name ${name} and version ${version}`
        )
      );
    }

    if (artifacts.length == 0) {
      console.log('create artifact');

      await ArtifactModel.create(
        {
          name, version, type,
        }
      );
    }

    console.log('update artifact');

    await ArtifactModel.updateMany(
      { name, version },
      {
        $set: {
          vulnerabilityList: data,
        },
      }
    );


    return res.json(
      successResponse(null, "Successfully imported vulnerabilities")
    );
  } catch (error) {
    console.log(error);
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}
