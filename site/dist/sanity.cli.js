import {defineCliConfig} from 'sanity/cli';
export default defineCliConfig({api:{projectId:process.env.SANITY_STUDIO_PROJECT_ID,dataset:process.env.SANITY_STUDIO_DATASET},vite:{envPrefix:['SANITY_STUDIO_']}});
