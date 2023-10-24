
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_DEFAULT_REGION
});

class AWSClient
{
    constructor()
    {
        this.client = client;

        this.bucket = process.env.AWS_S3_BUCKET;
        this.region = process.env.AWS_DEFAULT_REGION;
    }

    constructUrl = (key) =>
    {
        return `https://s3.amazonaws.com/${this.bucket}/${key}`;
    };

    // Creates the folder ${script_id} in the S3 bucket and returns the folder name
    createBrew = async (script_id) => 
    {
        try 
        {
            const folder = `${script_id}/`;
            const check = new HeadObjectCommand({ Bucket: this.bucket, Key: folder });
            const put = new PutObjectCommand({ Bucket: this.bucket, Key: folder });

            try
            {
                await this.client.send(check);
            }
            catch (err)
            {
                await this.client.send(put);
            }
            finally 
            {
                return folder;
            }
        }
        catch (err)
        {
            throw Error(`could not make folder: ${err}`);
        }
    };

    // Uploads a file to the given key in the S3 bucket
    uploadFile = async (key, file_path) =>
    {
        try 
        {
            const data = await fs.readFile(file_path);
            const put = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data });
            await this.client.send(put);
        }
        catch (err)
        {
            throw Error(`could not upload to ${key}: ${err}`);
        }
    };

    // Uploads ${script_id}/${pdf_type} to the S3 bucket; returns the object URL
    uploadDocument = async (script_id, file_path) => 
    {
        try 
        {
            const folder = await this.createBrew(script_id);
            const name = path.basename(file_path);
            const key = `${folder}${name}`;
            const url = this.constructUrl(key);
            
            await this.uploadFile(key, file_path);
            return url;
        }
        catch (err)
        {
            throw Error(`aws: could not upload pdf: ${err}`);
        }
    };

    // Uploads ${script_id}/${page_num} to the S3 bucket; returns the object URL
    uploadPage = async (script_id, document, file_path) =>
    {
        try 
        {
            const folder = await this.createBrew(script_id);
            const pages_folder = `${folder}pages/${document}/`;
            const name = path.basename(file_path);
            const key = `${pages_folder}${name}`;
            const url = this.constructUrl(key);
        
            await this.uploadFile(key, file_path);
            return url;
        }
        catch (err)
        {
            throw Error(`aws: could not upload page: ${err}`);
        }
    };
}

module.exports = AWSClient;